"use client";

import { useState, type JSX } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { insforge } from "@/lib/insforge-client";
import { saveResume } from "@/actions/profile";

const MAX_BYTES = 5 * 1024 * 1024;

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "error"; message: string }
  | { kind: "success"; fileName: string };

type Props = {
  userId: string;
  resumeUrl: string | null;
};

export function ResumeUpload({ userId, resumeUrl }: Props): JSX.Element {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isUploading = status.kind === "uploading";
  const hasResume = resumeUrl !== null || status.kind === "success";

  const upload = async (file: File): Promise<void> => {
    if (file.type !== "application/pdf") {
      setStatus({
        kind: "error",
        message: "That file is not a PDF. Please choose a PDF resume.",
      });
      return;
    }

    if (file.size > MAX_BYTES) {
      setStatus({
        kind: "error",
        message: "That file is over 5MB. Please choose a smaller PDF.",
      });
      return;
    }

    setStatus({ kind: "uploading" });

    try {
      // Uploaded from the browser so the request carries the signed-in user's
      // access token for Storage RLS, and so a 5MB PDF never has to fit through
      // a Server Action body.
      const { data, error } = await insforge.storage
        .from("resumes")
        .upload(`${userId}/resume.pdf`, file);

      if (error || !data) {
        console.error("[profile/ResumeUpload]", error);
        setStatus({
          kind: "error",
          message: "Could not upload your resume. Please try again.",
        });
        return;
      }

      const result = await saveResume(data.url, data.key);
      if (!result.success) {
        setStatus({
          kind: "error",
          message: result.error ?? "Could not save your resume. Please try again.",
        });
        return;
      }

      setStatus({ kind: "success", fileName: file.name });
    } catch (error) {
      console.error("[profile/ResumeUpload]", error);
      setStatus({
        kind: "error",
        message: "Could not upload your resume. Please try again.",
      });
    }
  };

  const handleFile = (file: File | undefined): void => {
    if (file) void upload(file);
  };

  const dropzoneLabel = (): string => {
    if (isUploading) return "Uploading…";
    if (status.kind === "success") return status.fileName;
    if (resumeUrl) return "Resume on file — click to replace";
    return "Click to upload or drag and drop";
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!isUploading) handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`mt-4 flex flex-col items-center rounded-xl border border-dashed border-border-muted px-6 py-10 text-center transition-colors focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ${
          isUploading
            ? "cursor-wait opacity-70"
            : "cursor-pointer hover:border-accent hover:bg-surface-secondary"
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          disabled={isUploading}
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            // Cleared so re-picking the same file fires change again — otherwise
            // retrying after a rejection, or replacing a resume with an
            // identically-named file, silently does nothing.
            event.target.value = "";
          }}
        />

        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted">
          {hasResume && !isUploading ? (
            <CheckCircle2 className="h-6 w-6 text-accent" />
          ) : (
            <UploadCloud className="h-6 w-6 text-accent" />
          )}
        </span>

        <span className="mt-4 text-sm font-semibold text-text-primary">
          {dropzoneLabel()}
        </span>
        <span className="mt-1 text-xs text-text-muted">
          PDF formatting only. Maximum file size 5MB.
        </span>

        <span className="mt-4 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary">
          Select Resume
        </span>
      </label>

      {status.kind === "error" && (
        <p className="mt-3 rounded-md bg-surface-secondary px-3 py-2 text-xs text-error" role="status">
          {status.message}
        </p>
      )}

      {status.kind === "success" && (
        <p
          className="mt-3 rounded-md bg-success-lightest px-3 py-2 text-xs text-success-foreground"
          role="status"
        >
          Resume uploaded.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          <FileText className="h-4 w-4" />
          Generate Resume from Profile
        </button>
      </div>
    </section>
  );
}
