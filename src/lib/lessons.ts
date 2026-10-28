export type LessonStep = {
  kicker: string;
  title: string;
  explanation: string;
  example: string;
  takeaway: string;
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  time: string;
  image: string;
  imageAlt: string;
  actionHref: string;
  actionLabel: string;
  steps: LessonStep[];
};

export const lessons: Lesson[] = [
  {
    slug: "plan-before-spending",
    title: "Plan before spending",
    summary: "Give your pocket money a job before purchases begin.",
    time: "2 min",
    image: "/images/budget-planning.jpg",
    imageAlt: "Cash, calculator and notebook used to make a budget",
    actionHref: "/budget",
    actionLabel: "Set my budget",
    steps: [
      {
        kicker: "Step 1 · Money in",
        title: "Start with what you actually receive.",
        explanation:
          "Add pocket money, part-time earnings and other income you expect this month. Do not plan with money you may never receive.",
        example: "₹5,000 pocket money + ₹1,000 tutoring = ₹6,000 income.",
        takeaway: "Income is your starting amount, not your spending target.",
      },
      {
        kicker: "Step 2 · Money out",
        title: "Protect essentials before wants.",
        explanation:
          "List travel, food and study costs first. Then decide how much can safely go toward entertainment or shopping.",
        example: "₹1,500 essentials + ₹1,000 wants leaves ₹3,500 unspent.",
        takeaway: "A budget is a plan, not a punishment.",
      },
      {
        kicker: "Step 3 · Your limit",
        title: "Choose one clear monthly ceiling.",
        explanation:
          "Your spending ceiling should be lower than your expected income so there is room for savings and surprises.",
        example: "With ₹6,000 income, a ₹3,500 spending limit leaves a buffer.",
        takeaway: "Check the limit before a purchase, not after it.",
      },
    ],
  },
  {
    slug: "save-for-a-target",
    title: "Save for a clear target",
    summary: "Turn small deposits into a goal you can see and measure.",
    time: "2 min",
    image: "/images/savings-goal.jpg",
    imageAlt: "Piggy bank beside a savings target",
    actionHref: "/goals",
    actionLabel: "Create a goal",
    steps: [
      {
        kicker: "Step 1 · Name it",
        title: "Make the goal specific.",
        explanation:
          "Saving is easier when you know exactly what the money is for. Use a name such as Laptop, Course fee or Emergency fund.",
        example: "“Laptop — ₹30,000” is clearer than “Save more money.”",
        takeaway: "A clear target gives every deposit a purpose.",
      },
      {
        kicker: "Step 2 · Break it down",
        title: "Turn a large target into small deposits.",
        explanation:
          "Divide the amount by the number of weeks or months available. The smaller number is easier to act on.",
        example: "₹12,000 in 6 months means saving ₹2,000 each month.",
        takeaway: "Small, regular deposits beat waiting for one big amount.",
      },
      {
        kicker: "Step 3 · Track it",
        title: "Record each deposit immediately.",
        explanation:
          "Update the goal whenever you reserve money. The progress bar shows how close you are and how much remains.",
        example: "₹3,000 saved toward ₹12,000 means 25% complete.",
        takeaway: "Visible progress helps you stay consistent.",
      },
    ],
  },
  {
    slug: "weekly-money-check",
    title: "Review once a week",
    summary: "Use five minutes to notice problems before the month ends.",
    time: "3 min",
    image: "/images/money-review.jpg",
    imageAlt: "Person reviewing expenses in a notebook",
    actionHref: "/transactions",
    actionLabel: "Review transactions",
    steps: [
      {
        kicker: "Step 1 · Check records",
        title: "Make sure every important purchase is recorded.",
        explanation:
          "Look at the last seven days and add anything missing. Correct records make every dashboard calculation useful.",
        example: "Add the forgotten ₹120 bus recharge before reviewing totals.",
        takeaway: "A dashboard is only as accurate as its records.",
      },
      {
        kicker: "Step 2 · Find the pattern",
        title: "Look for one category growing too quickly.",
        explanation:
          "Do not judge every purchase. Find the category using more money than expected and understand why.",
        example: "Three small food orders may cost more than one planned meal.",
        takeaway: "Patterns matter more than one unusual expense.",
      },
      {
        kicker: "Step 3 · Adjust",
        title: "Choose one small change for next week.",
        explanation:
          "Reduce one avoidable cost, update the budget if circumstances changed, or move a small amount toward your goal.",
        example: "Carry lunch twice next week and save the difference.",
        takeaway: "A weekly correction is easier than a month-end rescue.",
      },
    ],
  },
];

export function getLesson(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
