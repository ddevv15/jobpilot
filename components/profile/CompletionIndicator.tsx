import { type JSX } from "react";
import { AlertCircle } from "lucide-react";

type Props = {
  percentage: number;
  missingFields: string[];
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CompletionIndicator({
  percentage,
  missingFields,
}: Props): JSX.Element {
  const dashOffset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-error/15 bg-error/5 p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-error" />
          <h2 className="text-base font-semibold text-text-primary">
            Profile needs attention
          </h2>
        </div>

        <p className="mt-2 max-w-md text-sm text-text-secondary">
          Complete the missing fields to improve your chance of getting tailored
          matches and generating quality resumes.
        </p>

        {missingFields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span
                key={field}
                className="rounded-md bg-error/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-error"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative h-[92px] w-[92px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            className="stroke-border-light"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="stroke-error"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-text-primary">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
