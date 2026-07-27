import { type JSX } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  optional?: boolean;
  // Digits-only. Rejects the keystroke rather than reporting a bad value later,
  // so an unparseable number can never reach the save action.
  numeric?: boolean;
  maxLength?: number;
  className?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  optional = false,
  numeric = false,
  maxLength,
  className = "",
}: Props): JSX.Element {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
        {optional ? `${label} (Optional)` : label}
      </span>
      <input
        type={type}
        value={value}
        inputMode={numeric ? "numeric" : undefined}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(
            numeric
              ? event.target.value.replace(/[^0-9]/g, "")
              : event.target.value,
          )
        }
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-md border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
          readOnly
            ? "cursor-not-allowed bg-surface-secondary text-text-secondary"
            : "bg-surface"
        }`}
      />
    </label>
  );
}
