"use server";
import { Prisma } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateMoneyPosition } from "@/lib/finance";
import { advanceRecurringDate, dateOnly, indiaToday } from "@/lib/recurring";
import { materializeDueRecurring } from "@/lib/recurring-engine";
import {
  createRecoveryCode,
  hashRecoveryCode,
  matchesRecoveryCode,
} from "@/lib/recovery";
import {
  budgetSchema,
  depositSchema,
  goalSchema,
  passwordChangeSchema,
  recoverySchema,
  registerSchema,
  recurringSchema,
  transactionSchema,
} from "@/lib/validation";

async function userId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateAppShell() {
  revalidatePath("/", "layout");
}
export type RecoveryFormState = {
  status: "idle" | "error" | "success";
  message: string;
  code: string | null;
};

export async function registerAction(
  _previous: RecoveryFormState,
  formData: FormData,
): Promise<RecoveryFormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      message: "Check your name, email and password.",
      code: null,
    };
  const code = createRecoveryCode();
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hash(parsed.data.password, 12),
        recoveryCodeHash: hashRecoveryCode(code),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return {
        status: "error",
        message: "This email already has an account. Sign in instead.",
        code: null,
      };
    throw error;
  }
  return {
    status: "success",
    message:
      "Account created. Save this one-time recovery code before signing in.",
    code,
  };
}
export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) redirect("/signin?error=credentials");
    throw error;
  }
}
export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function recoverAccountAction(
  _previous: RecoveryFormState,
  formData: FormData,
): Promise<RecoveryFormState> {
  const parsed = recoverySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      message: "Check the email, recovery code and new password.",
      code: null,
    };
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, recoveryCodeHash: true },
  });
  if (
    !user ||
    !matchesRecoveryCode(parsed.data.recoveryCode, user.recoveryCodeHash)
  )
    return {
      status: "error",
      message: "Those recovery details are not valid. No password was changed.",
      code: null,
    };
  const replacement = createRecoveryCode();
  const updated = await prisma.user.updateMany({
    where: { id: user.id, recoveryCodeHash: user.recoveryCodeHash },
    data: {
      passwordHash: await hash(parsed.data.newPassword, 12),
      recoveryCodeHash: hashRecoveryCode(replacement),
      authVersion: { increment: 1 },
    },
  });
  if (!updated.count)
    return {
      status: "error",
      message: "That code has already been used. Try the latest code.",
      code: null,
    };
  return {
    status: "success",
    message:
      "Password reset. Save this replacement recovery code, then sign in.",
    code: replacement,
  };
}

export async function changeAccountName(formData: FormData) {
  const id = await userId();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 60) redirect("/settings?error=name");
  await prisma.user.update({ where: { id }, data: { name } });
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  redirect("/settings?saved=name");
}

export async function changePassword(formData: FormData) {
  const id = await userId();
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/settings?error=password");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { passwordHash: true },
  });
  if (!(await compare(parsed.data.currentPassword, user.passwordHash)))
    redirect("/settings?error=current");
  await prisma.user.update({
    where: { id },
    data: {
      passwordHash: await hash(parsed.data.newPassword, 12),
      authVersion: { increment: 1 },
    },
  });
  await signOut({ redirectTo: "/signin?passwordChanged=1" });
}

export async function createNewRecoveryCode(
  _previous: RecoveryFormState,
  formData: FormData,
): Promise<RecoveryFormState> {
  const id = await userId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { passwordHash: true },
  });
  if (
    !(await compare(String(formData.get("password") ?? ""), user.passwordHash))
  )
    return {
      status: "error",
      message: "Enter your current password to generate a new code.",
      code: null,
    };
  const code = createRecoveryCode();
  await prisma.user.update({
    where: { id },
    data: { recoveryCodeHash: hashRecoveryCode(code) },
  });
  return {
    status: "success",
    message: "Your previous recovery code no longer works. Save this one now.",
    code,
  };
}

export async function deleteAccount(formData: FormData) {
  const id = await userId();
  if (String(formData.get("confirmation")) !== "DELETE")
    redirect("/settings?error=confirmation");
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { passwordHash: true },
  });
  if (!(await compare(password, user.passwordHash)))
    redirect("/settings?error=current");
  await prisma.user.delete({ where: { id } });
  await signOut({ redirectTo: "/?accountDeleted=1" });
}
export async function addTransaction(formData: FormData) {
  const id = await userId();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/transactions?error=invalid");
  await prisma.transaction.create({ data: { userId: id, ...parsed.data } });
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/goals");
  revalidatePath("/budget");
  revalidateAppShell();
}
export async function deleteTransaction(formData: FormData) {
  const id = await userId();
  const result = await prisma.transaction.deleteMany({
    where: { id: String(formData.get("id")), userId: id },
  });
  if (!result.count) redirect("/transactions?error=missing");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/goals");
  revalidatePath("/budget");
  revalidateAppShell();
}
export async function updateTransaction(formData: FormData) {
  const id = await userId();
  const transactionId = String(formData.get("id") ?? "");
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/transactions?error=invalid");
  const result = await prisma.transaction.updateMany({
    where: { id: transactionId, userId: id },
    data: parsed.data,
  });
  if (!result.count) redirect("/transactions?error=missing");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/goals");
  revalidatePath("/budget");
  revalidateAppShell();
}
export async function addGoal(formData: FormData) {
  const id = await userId();
  const parsed = goalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/goals?error=goal-invalid");
  await prisma.goal.create({
    data: {
      userId: id,
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      targetDate: parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : null,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidateAppShell();
}
export async function updateGoal(formData: FormData) {
  const id = await userId();
  const goalId = String(formData.get("id") ?? "");
  const parsed = goalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/goals?error=goal-invalid");
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: id },
    select: { savedAmount: true },
  });
  if (!goal) redirect("/goals?error=missing");
  if (parsed.data.targetAmount < goal.savedAmount.toNumber()) {
    redirect("/goals?error=below-saved");
  }
  const result = await prisma.goal.updateMany({
    where: {
      id: goalId,
      userId: id,
      savedAmount: { lte: parsed.data.targetAmount },
    },
    data: {
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      targetDate: parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : null,
    },
  });
  if (!result.count) redirect("/goals?error=below-saved");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(formData: FormData) {
  const id = await userId();
  const result = await prisma.goal.deleteMany({
    where: { id: String(formData.get("id")), userId: id },
  });
  if (!result.count) redirect("/goals?error=missing");
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  revalidateAppShell();
}
export async function depositGoal(formData: FormData) {
  const id = await userId();
  const parsed = depositSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/goals?error=deposit-invalid");
  const result = await prisma.$transaction(async (database) => {
    const goal = await database.goal.findFirst({
      where: { id: parsed.data.goalId, userId: id },
    });
    if (!goal) return "missing";

    const [transactions, goals] = await Promise.all([
      database.transaction.findMany({
        where: { userId: id },
        select: { type: true, amount: true },
      }),
      database.goal.findMany({
        where: { userId: id },
        select: { savedAmount: true },
      }),
    ]);
    const position = calculateMoneyPosition(
      transactions.map((row) => ({
        type: row.type,
        amount: row.amount.toNumber(),
      })),
      goals.reduce((sum, item) => sum + item.savedAmount.toNumber(), 0),
    );
    if (parsed.data.amount > position.availableToSpend) return "insufficient";
    if (
      parsed.data.amount >
      goal.targetAmount.toNumber() - goal.savedAmount.toNumber()
    ) {
      return "target";
    }

    await database.goal.update({
      where: { id: goal.id },
      data: { savedAmount: { increment: parsed.data.amount } },
    });
    return "saved";
  });
  if (result !== "saved") redirect(`/goals?error=${result}`);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  revalidateAppShell();
}

export async function releaseGoalSavings(formData: FormData) {
  const id = await userId();
  const parsed = depositSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/goals?error=release-invalid");
  const result = await prisma.$transaction(async (database) => {
    const goal = await database.goal.findFirst({
      where: { id: parsed.data.goalId, userId: id },
    });
    if (!goal) return "missing";
    if (parsed.data.amount > goal.savedAmount.toNumber()) return "release";
    await database.goal.update({
      where: { id: goal.id },
      data: { savedAmount: { decrement: parsed.data.amount } },
    });
    return "saved";
  });
  if (result !== "saved") redirect(`/goals?error=${result}`);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/budget");
  revalidateAppShell();
}

export async function updateBudget(formData: FormData) {
  const id = await userId();
  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/budget?error=invalid");
  await prisma.budget.upsert({
    where: { userId: id },
    update: { monthlyLimit: parsed.data.monthlyLimit },
    create: { userId: id, monthlyLimit: parsed.data.monthlyLimit },
  });
  revalidatePath("/budget");
  revalidatePath("/dashboard");
  revalidateAppShell();
}

function refreshMoneyPages() {
  for (const path of [
    "/dashboard",
    "/transactions",
    "/goals",
    "/budget",
    "/recurring",
    "/reports",
  ])
    revalidatePath(path);
  revalidateAppShell();
}

function validRecurringStart(value: string) {
  const start = dateOnly(value);
  const today = indiaToday();
  const latest = new Date(today);
  latest.setUTCFullYear(latest.getUTCFullYear() + 1);
  return start >= today && start <= latest ? start : null;
}

export async function createRecurring(formData: FormData) {
  const id = await userId();
  const parsed = recurringSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/recurring?error=invalid");
  const start = validRecurringStart(parsed.data.startDate);
  if (!start) redirect("/recurring?error=date");
  await prisma.recurringTransaction.create({
    data: {
      userId: id,
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      category: parsed.data.category,
      frequency: parsed.data.frequency,
      dayOfMonth:
        parsed.data.frequency === "MONTHLY" ? start.getUTCDate() : null,
      nextRunOn: start,
    },
  });
  await materializeDueRecurring(id);
  refreshMoneyPages();
  redirect("/recurring?saved=1");
}

export async function updateRecurring(formData: FormData) {
  const id = await userId();
  const ruleId = String(formData.get("id"));
  const parsed = recurringSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/recurring?error=invalid");
  const start = validRecurringStart(parsed.data.startDate);
  if (!start) redirect("/recurring?error=date");
  const dayOfMonth =
    parsed.data.frequency === "MONTHLY" ? start.getUTCDate() : null;
  const alreadyPosted = await prisma.transaction.findFirst({
    where: { userId: id, recurringRuleId: ruleId, recurrenceDate: start },
    select: { id: true },
  });
  const changed = await prisma.recurringTransaction.updateMany({
    where: { id: ruleId, userId: id },
    data: {
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      category: parsed.data.category,
      frequency: parsed.data.frequency,
      dayOfMonth,
      nextRunOn: alreadyPosted
        ? advanceRecurringDate(start, parsed.data.frequency, dayOfMonth)
        : start,
      active: true,
    },
  });
  if (!changed.count) redirect("/recurring?error=missing");
  await materializeDueRecurring(id);
  refreshMoneyPages();
  redirect("/recurring?saved=1");
}

export async function toggleRecurring(formData: FormData) {
  const id = await userId();
  const active = String(formData.get("state")) === "resume";
  const rule = await prisma.recurringTransaction.findFirst({
    where: { id: String(formData.get("id")), userId: id },
  });
  if (!rule) redirect("/recurring?error=missing");
  await prisma.recurringTransaction.updateMany({
    where: { id: rule.id, userId: id, active: !active },
    data: {
      active,
      ...(active && rule.nextRunOn < indiaToday()
        ? { nextRunOn: indiaToday() }
        : {}),
    },
  });
  if (active) await materializeDueRecurring(id);
  refreshMoneyPages();
}

export async function deleteRecurring(formData: FormData) {
  const id = await userId();
  const changed = await prisma.recurringTransaction.deleteMany({
    where: { id: String(formData.get("id")), userId: id },
  });
  if (!changed.count) redirect("/recurring?error=missing");
  refreshMoneyPages();
}

const lessonKeys = [
  "plan-before-spending",
  "save-for-a-target",
  "weekly-money-check",
] as const;

export async function updateLessonProgressAction(formData: FormData) {
  const id = await userId();
  const lessonKey = String(formData.get("lessonKey"));
  if (!lessonKeys.includes(lessonKey as (typeof lessonKeys)[number])) {
    redirect("/learn");
  }
  const currentStep = Number(formData.get("currentStep"));
  if (!Number.isInteger(currentStep) || currentStep < 0 || currentStep > 2) {
    redirect(`/learn/${lessonKey}?error=invalid`);
  }
  const completed = formData.get("completed") === "true";
  await prisma.lessonProgress.upsert({
    where: { userId_lessonKey: { userId: id, lessonKey } },
    update: { currentStep, completed },
    create: { userId: id, lessonKey, currentStep, completed },
  });
  revalidatePath("/learn");
  revalidatePath(`/learn/${lessonKey}`);
  redirect(`/learn/${lessonKey}`);
}
