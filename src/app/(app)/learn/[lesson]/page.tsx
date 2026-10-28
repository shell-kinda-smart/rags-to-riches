import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CircleCheckBig,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { updateLessonProgressAction } from "@/app/actions";
import { auth } from "@/auth";
import { getLesson } from "@/lib/lessons";
import { prisma } from "@/lib/prisma";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lesson: string }>;
}) {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");
  const { lesson: slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const progress = await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonKey: { userId: session.user.id, lessonKey: lesson.slug },
    },
  });
  const currentStep = Math.min(
    lesson.steps.length - 1,
    progress?.currentStep ?? 0,
  );
  const step = lesson.steps[currentStep];

  if (progress?.completed) {
    return (
      <section className="page-shell max-w-4xl">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d5d52] hover:text-[#207849]"
        >
          <ArrowLeft className="size-3.5" /> Back to Money guides
        </Link>
        <article className="card mt-4 p-6 text-center sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#d9ed70] text-[#174b35]">
            <CircleCheckBig className="size-6" />
          </span>
          <p className="eyebrow mt-5">LESSON COMPLETE</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
            {lesson.title}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#4d5d52]">
            You finished all three ideas. Put the habit into practice now, or
            restart the short lesson whenever you need a reminder.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href={lesson.actionHref} className="btn btn-primary">
              {lesson.actionLabel} <ArrowRight className="size-4" />
            </Link>
            <form action={updateLessonProgressAction}>
              <input type="hidden" name="lessonKey" value={lesson.slug} />
              <input type="hidden" name="currentStep" value="0" />
              <input type="hidden" name="completed" value="false" />
              <button className="btn btn-secondary">
                <RotateCcw className="size-4" /> Review from start
              </button>
            </form>
          </div>
        </article>
      </section>
    );
  }

  const percent = Math.round(((currentStep + 1) / lesson.steps.length) * 100);

  return (
    <section className="page-shell max-w-5xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d5d52] hover:text-[#207849]"
          >
            <ArrowLeft className="size-3.5" /> Exit lesson
          </Link>
          <h1 className="app-page-heading mt-3">{lesson.title}</h1>
          <p className="app-page-subtitle">{lesson.summary}</p>
        </div>
        <span className="rounded-lg border border-[#d9e0da] bg-[#fbfaf5] px-3 py-2 text-[10px] font-semibold text-[#4d5d52]">
          Step {currentStep + 1} of {lesson.steps.length}
        </span>
      </header>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#dfe5e0]">
        <i
          className="block h-full rounded-full bg-[#207849] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <article className="card mt-4 grid overflow-hidden !bg-[#fbfaf5] lg:grid-cols-[1.25fr_.75fr]">
        <div className="p-6 sm:p-9">
          <p className="eyebrow">{step.kicker.toUpperCase()}</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-.045em]">
            {step.title}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5f6e65]">
            {step.explanation}
          </p>
          <div className="mt-6 rounded-xl border border-[#d9e0da] bg-[#f4f0e7] p-4">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.09em] text-[#207849]">
              <Lightbulb className="size-3.5" /> Easy example
            </p>
            <p className="mt-2 text-xs leading-5 text-[#526159]">
              {step.example}
            </p>
          </div>
        </div>
        <aside className="flex flex-col justify-between border-t border-[#dfe5e0] bg-[#edf2ec] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div>
            <span className="grid size-9 place-items-center rounded-lg bg-white/75 text-[#207849]">
              <BookOpenCheck className="size-[18px]" />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.1em] text-[#526158]">
              Remember this
            </p>
            <p className="mt-2 text-base font-semibold leading-6 text-[#26372e]">
              {step.takeaway}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {currentStep > 0 && (
              <form action={updateLessonProgressAction}>
                <input type="hidden" name="lessonKey" value={lesson.slug} />
                <input
                  type="hidden"
                  name="currentStep"
                  value={currentStep - 1}
                />
                <input type="hidden" name="completed" value="false" />
                <button className="btn btn-secondary">Back</button>
              </form>
            )}
            <form action={updateLessonProgressAction} className="flex-1">
              <input type="hidden" name="lessonKey" value={lesson.slug} />
              <input
                type="hidden"
                name="currentStep"
                value={Math.min(currentStep + 1, lesson.steps.length - 1)}
              />
              <input
                type="hidden"
                name="completed"
                value={
                  currentStep === lesson.steps.length - 1 ? "true" : "false"
                }
              />
              <button className="btn btn-primary w-full">
                {currentStep === lesson.steps.length - 1 ? (
                  <>
                    Finish lesson <Check className="size-4" />
                  </>
                ) : (
                  <>
                    Next idea <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </div>
          <p className="mt-4 text-[9px] leading-4 text-[#526158]">
            Your current step is stored in your account after you continue.
          </p>
        </aside>
      </article>
    </section>
  );
}
