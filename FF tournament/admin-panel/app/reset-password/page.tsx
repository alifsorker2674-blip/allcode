import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16 text-[var(--color-text-muted)]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
