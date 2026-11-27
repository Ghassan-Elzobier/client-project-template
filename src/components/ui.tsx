import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

// The shared pieces every page is built from, each shown at /design in its
// states. Restyle them here from the client's design, once, and every page
// follows (the /design skill). A pattern used twice becomes one of these.

/** A page: its heading, an optional lead, and the content in one readable column. */
export function Page({ title, lead, children }: { title: string; lead?: ReactNode; children?: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-5 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {lead && <p className="text-lg text-ink-muted">{lead}</p>}
      </header>
      {children}
    </main>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  /** The button's work is under way: it says so, and can't be pressed twice. */
  busy?: boolean;
};

/** A button that says what it does. One primary button per view. */
export function Button({ variant = "primary", busy = false, disabled, className, children, ...props }: ButtonProps) {
  const look =
    variant === "primary"
      ? "bg-brand text-brand-ink hover:opacity-90"
      : "border border-line bg-canvas text-ink hover:bg-surface";
  return (
    <button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-60",
        look,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  /** Help shown under the label, before anyone types. */
  hint?: string;
  /** What is wrong with the value, and what to do about it. */
  error?: string;
};

/** A labelled text input, with its hint and its error tied to it for screen readers. */
export function Field({ name, label, hint, error, id, ...props }: FieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <input
        {...props}
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="block min-h-11 w-full rounded-md border border-line bg-canvas px-3 text-base aria-invalid:border-danger"
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const NOTICE_LOOK = {
  info: "border-line",
  success: "border-success",
  error: "border-danger",
} as const;

/** A message about what just happened or what to do next. Errors are announced at once. */
export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: keyof typeof NOTICE_LOOK;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border-l-4 bg-surface p-4 ${NOTICE_LOOK[tone]}`}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className="text-sm">{children}</div>
    </div>
  );
}
