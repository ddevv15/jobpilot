"use client";

import { useState, useTransition, type JSX } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TextField } from "@/components/profile/TextField";
import { SelectField, type Option } from "@/components/profile/SelectField";
import { TagInput } from "@/components/profile/TagInput";
import { saveProfile, type SaveProfileResult } from "@/actions/profile";
import type { ProfileFormValues, RoleFormValue } from "@/lib/profile";

const SELECT_PLACEHOLDER: Option = { value: "", label: "Select…" };

const WORK_AUTH_OPTIONS: Option[] = [
  SELECT_PLACEHOLDER,
  { value: "citizen", label: "Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "visa_required", label: "Visa Required" },
];

const EXPERIENCE_OPTIONS: Option[] = [
  SELECT_PLACEHOLDER,
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
];

const DEGREE_OPTIONS: Option[] = [
  SELECT_PLACEHOLDER,
  { value: "high_school", label: "High School" },
  { value: "associate", label: "Associate" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "phd", label: "PhD" },
];

const REMOTE_OPTIONS: Option[] = [
  SELECT_PLACEHOLDER,
  { value: "any", label: "Any" },
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
];

function createEmptyRole(): RoleFormValue {
  return {
    id: crypto.randomUUID(),
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    responsibilities: "",
  };
}

type Props = {
  email: string;
  initialValues: ProfileFormValues;
};

export function ProfileForm({ email, initialValues }: Props): JSX.Element {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SaveProfileResult | null>(null);

  const setField = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ): void => setValues((prev) => ({ ...prev, [key]: value }));

  const addTag = (key: "skills" | "industries", value: string): void => {
    const trimmed = value.trim();
    if (!trimmed || values[key].includes(trimmed)) return;
    setValues((prev) => ({ ...prev, [key]: [...prev[key], trimmed] }));
  };

  const removeTag = (key: "skills" | "industries", value: string): void =>
    setValues((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item !== value),
    }));

  const addRole = (): void => {
    if (values.workExperience.length >= 3) return;
    setValues((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, createEmptyRole()],
    }));
  };

  const updateRole = (id: string, patch: Partial<RoleFormValue>): void =>
    setValues((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((role) =>
        role.id === id ? { ...role, ...patch } : role,
      ),
    }));

  const removeRole = (id: string): void =>
    setValues((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((role) => role.id !== id),
    }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      setResult(await saveProfile(values));
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
    >
      <h2 className="text-base font-semibold text-text-primary">
        Profile Information
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        This context is used to accurately represent you in agent interactions.
      </p>

      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Personal Info
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <TextField
            label="Full Name"
            value={values.fullName}
            onChange={(value) => setField("fullName", value)}
          />
          <TextField label="Email" value={email} onChange={() => {}} readOnly />
          <TextField
            label="Phone Number"
            value={values.phone}
            onChange={(value) => setField("phone", value)}
            placeholder="+1 (555) 000-0000"
          />
          <TextField
            label="Location"
            value={values.location}
            onChange={(value) => setField("location", value)}
            placeholder="City, Country"
          />
          <TextField
            label="LinkedIn URL"
            value={values.linkedinUrl}
            onChange={(value) => setField("linkedinUrl", value)}
          />
          <TextField
            label="Portfolio / GitHub"
            value={values.portfolioUrl}
            onChange={(value) => setField("portfolioUrl", value)}
          />
          <SelectField
            label="Work Authorization"
            value={values.workAuthorization}
            onChange={(value) => setField("workAuthorization", value)}
            options={WORK_AUTH_OPTIONS}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Professional Info
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <TextField
            label="Current/Recent Job Title"
            value={values.currentTitle}
            onChange={(value) => setField("currentTitle", value)}
            className="sm:col-span-2"
          />
          <SelectField
            label="Experience Level"
            value={values.experienceLevel}
            onChange={(value) => setField("experienceLevel", value)}
            options={EXPERIENCE_OPTIONS}
          />
          <TextField
            label="Years of Experience"
            numeric
            maxLength={2}
            value={values.yearsExperience}
            onChange={(value) => setField("yearsExperience", value)}
          />
          <TagInput
            label="Skills"
            placeholder="Add a skill"
            tags={values.skills}
            onAdd={(value) => addTag("skills", value)}
            onRemove={(value) => removeTag("skills", value)}
            className="sm:col-span-2"
          />
          <TagInput
            label="Industries Worked In"
            optional
            placeholder="E.g. FinTech, Healthcare"
            tags={values.industries}
            onAdd={(value) => addTag("industries", value)}
            onRemove={(value) => removeTag("industries", value)}
            className="sm:col-span-2"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            Work Experience
          </h3>
          {values.workExperience.length < 3 && (
            <button
              type="button"
              onClick={addRole}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add role
            </button>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {values.workExperience.map((role, index) => (
            <div key={role.id} className="rounded-xl border border-border p-4">
              {index > 0 && (
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeRole(role.id)}
                    className="flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-error"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <TextField
                  label="Company Name"
                  value={role.company}
                  onChange={(value) => updateRole(role.id, { company: value })}
                />
                <TextField
                  label="Job Title"
                  value={role.title}
                  onChange={(value) => updateRole(role.id, { title: value })}
                />
                <TextField
                  label="Start Date"
                  type="month"
                  value={role.startDate}
                  onChange={(value) => updateRole(role.id, { startDate: value })}
                />
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      End Date
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                      <input
                        type="checkbox"
                        checked={role.isCurrent}
                        onChange={(event) =>
                          updateRole(role.id, {
                            isCurrent: event.target.checked,
                            endDate: event.target.checked ? "" : role.endDate,
                          })
                        }
                        className="h-4 w-4 rounded border-border accent-accent"
                      />
                      Currently working here
                    </label>
                  </div>
                  <input
                    type="month"
                    value={role.endDate}
                    disabled={role.isCurrent}
                    onChange={(event) =>
                      updateRole(role.id, { endDate: event.target.value })
                    }
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted"
                  />
                </div>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
                    Key Responsibilities
                  </span>
                  <textarea
                    rows={3}
                    value={role.responsibilities}
                    onChange={(event) =>
                      updateRole(role.id, {
                        responsibilities: event.target.value,
                      })
                    }
                    className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Education
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <SelectField
            label="Highest Degree"
            value={values.degree}
            onChange={(value) => setField("degree", value)}
            options={DEGREE_OPTIONS}
          />
          <TextField
            label="Field of Study"
            value={values.fieldOfStudy}
            onChange={(value) => setField("fieldOfStudy", value)}
          />
          <TextField
            label="Institution Name"
            value={values.institution}
            onChange={(value) => setField("institution", value)}
            placeholder="E.g. State University"
          />
          <TextField
            label="Graduation Year"
            numeric
            maxLength={4}
            value={values.graduationYear}
            onChange={(value) => setField("graduationYear", value)}
            placeholder="YYYY"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Job Preferences
        </h3>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <TextField
            label="Job Titles Seeking"
            value={values.jobTitlesSeeking}
            onChange={(value) => setField("jobTitlesSeeking", value)}
            className="sm:col-span-2"
          />
          <SelectField
            label="Remote Preference"
            value={values.remotePreference}
            onChange={(value) => setField("remotePreference", value)}
            options={REMOTE_OPTIONS}
          />
          <TextField
            label="Salary Expectation"
            optional
            value={values.salaryExpectation}
            onChange={(value) => setField("salaryExpectation", value)}
            placeholder="E.g. $120k+"
          />
          <TextField
            label="Preferred Locations"
            optional
            value={values.preferredLocations}
            onChange={(value) => setField("preferredLocations", value)}
            placeholder="E.g. New York, London"
            className="sm:col-span-2"
          />
        </div>
      </div>

      {result && (
        <p
          className={`mt-6 rounded-md px-3 py-2 text-xs ${
            result.success
              ? "bg-success-lightest text-success-foreground"
              : "bg-surface-secondary text-error"
          }`}
          role="status"
        >
          {result.success
            ? "Profile saved."
            : (result.error ?? "Could not save your profile. Please try again.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
