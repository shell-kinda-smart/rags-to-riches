import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  Play,
  RotateCcw,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { lessons } from "@/lib/lessons";

export default async function Learn() {
  const session = await auth();
  if (!session?.user.id) redirect("/signin");

  const savedLessons = await prisma.lessonProgress.findMany({
    where: { userId: session.user.id },
  });
  const savedByKey = new Map(
    savedLessons.map((progress) => [progress.lessonKey, progress]),
  );
  const completedCount = savedLessons.filter(
    (progress) => progress.completed,
  ).length;
  return (
    <section className="page-shell">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="app-page-heading">Money guides</h1>
          <p className="app-page-subtitle">
            Tiny lessons, plain language and one useful action after each one.
          </p>
        </div>
        <div className="rounded-lg border border-[#d9e0da] bg-[#fbfaf5] px-3 py-2 text-[10px] font-semibold text-[#4d5d52]">
          {completedCount} of {lessons.length} completed
        </div>
      </header>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">SHORT LESSONS</p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">
            Understand the habits behind the app
          </h2>
        </div>
        <span className="hidden text-[10px] text-[#526158] sm:block">
          Progress is saved to your account
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {lessons.map((lesson, index) => {
          const progress = savedByKey.get(lesson.slug);
          const completed = progress?.completed ?? false;
          const started = Boolean(progress);
          const status = completed
            ? "Review"
            : progress
              ? `Continue · ${progress.currentStep + 1}/3`
              : "Start lesson";
          return (
            <Link
              href={`/learn/${lesson.slug}`}
              key={lesson.slug}
              className="card card-interactive group overflow-hidden !bg-[#fbfaf5]"
            >
              <div className="relative h-32">
                <Image
                  src={lesson.image}
                  alt={lesson.imageAlt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute left-3 top-3 rounded-md bg-[#103f2c] px-2 py-1 text-[9px] font-semibold text-white">
                  Lesson {index + 1}
                </span>
                {completed && (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-[#d9ed70] text-[#174b35]">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#16271f]">
                    {lesson.title}
                  </h3>
                  <span className="flex shrink-0 items-center gap-1 text-[9px] text-[#526158]">
                    <Clock3 className="size-3" /> {lesson.time}
                  </span>
                </div>
                <p className="mt-2 min-h-10 text-[11px] leading-5 text-[#4d5d52]">
                  {lesson.summary}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#e5e9e5] pt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#207849]">
                    {completed ? (
                      <RotateCcw className="size-3.5" />
                    ) : started ? (
                      <BookOpenCheck className="size-3.5" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    {status}
                  </span>
                  <ArrowRight className="size-3.5 text-[#207849] transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
