import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email(),
  password: z.string().min(8).max(72),
});
export const transactionSchema = z.object({
  description: z.string().trim().min(2).max(80),
  amount: z.coerce.number().int().positive().max(10000000),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(2).max(40),
  occurredAt: z.coerce.date(),
});
export const goalSchema = z.object({
  name: z.string().trim().min(2).max(60),
  targetAmount: z.coerce.number().int().positive().max(100000000),
  targetDate: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          !Number.isNaN(new Date(value).getTime()) &&
          new Date(value).toISOString().slice(0, 10) === value),
    ),
});
export const depositSchema = z.object({
  goalId: z.string().min(1),
  amount: z.coerce.number().int().positive().max(100000000),
});
export const budgetSchema = z.object({
  monthlyLimit: z.coerce.number().int().positive().max(100000000),
});

export const recurringSchema = transactionSchema
  .omit({ occurredAt: true })
  .extend({
    frequency: z.enum(["WEEKLY", "MONTHLY"]),
    startDate: z.iso.date(),
  });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(72),
});

export const recoverySchema = z.object({
  email: z.email(),
  recoveryCode: z.string().min(20).max(100),
  newPassword: z.string().min(8).max(72),
});
