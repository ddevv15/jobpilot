import { type JSX } from "react";
import { ChevronDown } from "lucide-react";

export type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}: Props): JSX.Element {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2 pr-9 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    </label>
  );
}
