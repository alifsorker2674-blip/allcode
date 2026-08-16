"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ data: { resetToken?: string } | null }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSubmitted(true);
      setDevResetToken(res.data?.resetToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-heading mb-6 text-2xl font-bold">Forgot Password</h1>
      <Card>
        {submitted ? (
          <div className="flex flex-col gap-3">
            <Alert variant="success">
              If an account with that email exists, a password reset link has been generated.
            </Alert>
            {devResetToken && (
              <div className="rounded-md border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 p-3 text-sm">
                <p className="mb-2 text-[var(--color-warning)]">
                  Dev mode — no email service is configured yet, so here&apos;s your reset link directly:
                </p>
                <Link
                  href={`/reset-password?token=${devResetToken}`}
                  className="break-all text-[var(--color-primary)] underline"
                >
                  /reset-password?token={devResetToken}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </Card>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        <Link href="/login" className="text-[var(--color-primary)]">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}
