import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthVisual } from "@/components/auth-visual";
import { RecoveryForm } from "@/components/recovery-form";

export default function RecoverPage() {
  return (
    <main className="auth-page">
      <AuthVisual mode="signin" />
      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="auth-mobile-brand">
            <span className="brand-mark">₹</span>
            <span>
              Rags to <strong>Riches</strong>
            </span>
          </Link>
          <Link href="/signin" className="auth-back">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
        <div className="auth-form-wrap">
          <p className="auth-form-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Find your way back.</h1>
          <p className="auth-form-copy">
            Use the recovery code you saved when creating your account. The old
            code is replaced after a successful reset.
          </p>
          <RecoveryForm />
        </div>
        <p className="auth-panel-foot">
          Lost your code too? Without a verified email service, this local app
          cannot prove account ownership another way.
        </p>
      </section>
    </main>
  );
}
