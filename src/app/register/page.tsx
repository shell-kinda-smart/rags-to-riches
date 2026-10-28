import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthVisual } from "@/components/auth-visual";
import { RegistrationForm } from "@/components/registration-form";

export default function Register() {
  return (
    <main className="auth-page">
      <AuthVisual mode="register" />
      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="auth-mobile-brand">
            <span className="brand-mark">₹</span>
            <span>
              Rags to <strong>Riches</strong>
            </span>
          </Link>
          <Link href="/" className="auth-back">
            <ArrowLeft size={15} aria-hidden="true" /> Back to home
          </Link>
        </div>
        <div className="auth-form-wrap">
          <p className="auth-form-eyebrow">GET STARTED</p>
          <h1>Make money make sense.</h1>
          <p className="auth-form-copy">
            Create your account, then add your first income or expense.
          </p>
          <RegistrationForm />
        </div>
        <p className="auth-panel-foot">
          Your records stay separate from other accounts.
        </p>
      </section>
    </main>
  );
}
