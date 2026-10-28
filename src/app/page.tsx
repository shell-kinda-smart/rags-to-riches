import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { WorkspacePreview } from "@/components/workspace-preview";

const steps = [
  {
    number: "01",
    title: "Record what comes in",
    copy: "Add pocket money, a part-time payment or any other income in a few seconds.",
  },
  {
    number: "02",
    title: "See where it goes",
    copy: "Log spending by category and see your remaining monthly budget as it changes.",
  },
  {
    number: "03",
    title: "Save for something real",
    copy: "Create a goal, add deposits and follow your progress one small step at a time.",
  },
];

export default function Home() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <div className="marketing-container marketing-nav">
          <Link
            href="/"
            className="marketing-brand"
            aria-label="Rags to Riches home"
          >
            <span className="brand-mark">₹</span>
            <span>
              Rags to <strong>Riches</strong>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="marketing-nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#what-you-get">What you get</a>
          </nav>
          <div className="marketing-nav-actions">
            <Link href="/signin" className="marketing-signin">
              Sign in
            </Link>
            <Link href="/register" className="btn btn-primary">
              Get started <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <section className="marketing-hero marketing-container">
        <div className="marketing-hero-copy">
          <p className="marketing-eyebrow">
            <span /> Money made clearer for students
          </p>
          <h1>
            Small money.
            <br />
            <em>Big picture.</em>
          </h1>
          <p className="marketing-lead">
            Know what you earn, what you spend and what you can set aside. One
            simple workspace for pocket money, part-time income and your next
            goal.
          </p>
          <div className="marketing-hero-actions">
            <Link
              href="/register"
              className="btn btn-primary marketing-hero-cta"
            >
              Create your workspace <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className="marketing-text-link">
              See how it works <ChevronRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="marketing-assurances" aria-label="Product details">
            <span>
              <Check size={15} aria-hidden="true" /> No bank connection
            </span>
            <span>
              <Check size={15} aria-hidden="true" /> Your entries stay private
            </span>
          </div>
        </div>
        <div className="marketing-preview-wrap">
          <WorkspacePreview />
          <p className="marketing-preview-caption">
            An illustrative look at your workspace
          </p>
        </div>
      </section>
      <section id="how-it-works" className="marketing-steps">
        <div className="marketing-container">
          <div className="marketing-section-heading">
            <div>
              <p className="marketing-section-label">A simple routine</p>
              <h2>From pocket money to a plan.</h2>
            </div>
            <p>
              Start with what you have. The picture becomes clearer every time
              you add an entry.
            </p>
          </div>
          <div className="marketing-step-grid">
            {steps.map((step) => (
              <article className="marketing-step" key={step.number}>
                <span className="marketing-step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section
        id="what-you-get"
        className="marketing-story marketing-container"
      >
        <div className="marketing-story-image">
          <Image
            src="/images/money-review.jpg"
            alt="A person planning savings in a notebook"
            fill
            sizes="(max-width: 960px) 100vw, 42vw"
            className="object-cover"
          />
        </div>
        <div className="marketing-story-copy">
          <p className="marketing-section-label">
            Built for everyday decisions
          </p>
          <h2>Make the next choice with more confidence.</h2>
          <p className="marketing-story-intro">
            You do not need a spreadsheet or a bank connection to understand
            your money. Add the numbers yourself; Rags to Riches turns them into
            a useful picture.
          </p>
          <ul>
            <li>
              <Check size={17} aria-hidden="true" />
              <span>
                <strong>Money overview</strong> — see income, spending, goal
                savings and what is free to use together.
              </span>
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              <span>
                <strong>Budget signals</strong> — know when you are nearing your
                limit.
              </span>
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              <span>
                <strong>Savings goals</strong> — track every deposit toward what
                matters.
              </span>
            </li>
            <li>
              <Check size={17} aria-hidden="true" />
              <span>
                <strong>Short money guides</strong> — learn practical habits as
                you go.
              </span>
            </li>
          </ul>
        </div>
      </section>
      <section className="marketing-bottom">
        <div className="marketing-container marketing-bottom-inner">
          <div>
            <p className="marketing-section-label">Start where you are</p>
            <h2>Give your money a little direction.</h2>
            <p>Your first entry is enough to begin.</p>
          </div>
          <Link href="/register" className="btn marketing-light-cta">
            Create a free account <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <footer className="marketing-footer marketing-container">
        <span>© Rags to Riches</span>
        <span>Made for better student money habits.</span>
      </footer>
    </main>
  );
}
