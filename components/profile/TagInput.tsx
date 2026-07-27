"use client";

import { useState, type JSX } from "react";
import { X } from "lucide-react";

type Props = {
  label: string;
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
  optional?: boolean;
  className?: string;
};

export function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  placeholder,
  optional = false,
  className = "",
}: Props): JSX.Element {
  const [text, setText] = useState("");

  const commit = (): void => {
    onAdd(text);
    setText("");
  };

  return (
    <div className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
        {optional ? `${label} (Optional)` : label}
      </span>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-secondary px-2.5 py-1 text-xs font-medium text-text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                aria-label={`Remove ${tag}`}
                className="text-text-muted transition-colors hover:text-error"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
