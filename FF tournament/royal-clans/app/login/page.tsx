"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-heading mb-6 text-2xl font-bold">Log In</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        <Link href="/forgot-password" className="text-[var(--color-primary)]">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        No account yet?{" "}
        <Link href="/register" className="text-[var(--color-primary)]">
          Register
        </Link>
      </p>
    </div>
  );
}
