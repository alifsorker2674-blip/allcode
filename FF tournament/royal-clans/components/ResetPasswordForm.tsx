"use client";

import { useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: { token, newPassword } });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-heading mb-6 text-2xl font-bold">Reset Password</h1>
      <Card>
        {done ? (
          <Alert variant="success">Password reset — redirecting to login...</Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert>{error}</Alert>}
            <div>
              <Label>Reset Token</Label>
              <Input required value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Resetting..." : "Reset Password"}
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
