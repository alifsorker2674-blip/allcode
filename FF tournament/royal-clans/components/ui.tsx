import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "danger" }) {
  const base = "rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary: "bg-[var(--color-primary)] text-[#171717] hover:brightness-110",
    outline: "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]",
    danger: "bg-[var(--color-error)] text-white hover:brightness-110",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] ${props.className || ""}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-sm text-[var(--color-text-muted)]">{children}</label>;
}

const statusColors: Record<string, string> = {
  pending: "text-[var(--color-warning)] bg-[var(--color-warning)]/10",
  approved: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  rejected: "text-[var(--color-error)] bg-[var(--color-error)]/10",
  live: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  completed: "text-[var(--color-text-muted)] bg-[var(--color-surface-raised)]",
  cancelled: "text-[var(--color-error)] bg-[var(--color-error)]/10",
  auto_confirmed: "text-[var(--color-success)] bg-[var(--color-success)]/10",
  under_review: "text-[var(--color-warning)] bg-[var(--color-warning)]/10",
  admin_resolved: "text-[var(--color-success)] bg-[var(--color-success)]/10",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] || "text-[var(--color-text-muted)] bg-[var(--color-surface-raised)]"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Alert({ children, variant = "error" }: { children: ReactNode; variant?: "error" | "success" }) {
  const styles =
    variant === "error"
      ? "border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-[var(--color-error)]"
      : "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]";
  return <div className={`rounded-md border px-3 py-2 text-sm ${styles}`}>{children}</div>;
}
