import Link from "next/link";

export function AuthVisual({ mode }: { mode: "signin" | "register" }) {
  return (
    <aside className="auth-visual">
      <Link href="/" className="auth-visual-brand">
        <span className="brand-mark">₹</span>
        <span>
          Rags to <strong>Riches</strong>
        </span>
      </Link>
      <div className="auth-visual-content">
        <p className="auth-visual-eyebrow">A better money habit starts here</p>
        <h2>
          {mode === "register"
            ? "Start small. See further."
            : "Welcome back to clarity."}
        </h2>
        <p>
          Keep everyday spending in view, make room for savings and learn as you
          go.
        </p>
        <div
          className="auth-visual-snapshot"
          aria-label="Illustrative finance example"
        >
          <div className="auth-snapshot-top">
            <span>Money snapshot</span>
            <span>Illustrative example</span>
          </div>
          <div className="auth-snapshot-amount">
            <span>Available to spend</span>
            <strong>₹3,450</strong>
          </div>
          <div className="auth-snapshot-divider" />
          <div className="auth-snapshot-bottom">
            <span>
              Money in <strong>₹6,800</strong>
            </span>
            <span>
              Money out <strong>₹1,350</strong>
            </span>
            <span>
              In goals <strong>₹2,000</strong>
            </span>
          </div>
        </div>
      </div>
      <p className="auth-visual-foot">
        Pocket money. Part-time earnings. Real progress.
      </p>
    </aside>
  );
}
