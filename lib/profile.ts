import type { Profile, WorkExperienceEntry, Education } from "@/types";

// Client-form shape. Roles carry a client-only `id` for stable React keys; it is
// stripped before writing to the DB. `email` is deliberately absent — it is
// read-only and always sourced from the session, never the form.
export type RoleFormValue = {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
};

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: RoleFormValue[];
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
};

// What the save action writes. Enum columns are typed `string | null` (not the
// Profile unions) so mapping needs no `as` — the DB CHECK constraints are the
// authority on allowed values.
export type ProfileWrite = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperienceEntry[];
  education: Education;
  job_titles_seeking: string[];
  remote_preference: string | null;
  preferred_locations: string[];
  salary_expectation: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
};

export const EMPTY_FORM_VALUES: ProfileFormValues = {
  fullName: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  workAuthorization: "",
  currentTitle: "",
  experienceLevel: "",
  yearsExperience: "",
  skills: [],
  industries: [],
  workExperience: [],
  degree: "",
  fieldOfStudy: "",
  institution: "",
  graduationYear: "",
  jobTitlesSeeking: "",
  remotePreference: "",
  salaryExpectation: "",
  preferredLocations: "",
};

function str(value: string | null | undefined): string {
  return value ?? "";
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseYears(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number.parseInt(trimmed, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Bounded rather than merely parseable — the form filters to digits, but the
// action is the last line of defence and a year like 99999 is not a year.
const MIN_GRAD_YEAR = 1900;
const MAX_GRAD_YEAR_OFFSET = 10;

function parseGradYear(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n)) return undefined;
  const max = new Date().getFullYear() + MAX_GRAD_YEAR_OFFSET;
  return n >= MIN_GRAD_YEAR && n <= max ? n : undefined;
}

// A role the user added but never filled carries no information — dropping it
// keeps empty objects out of the work_experience JSONB array.
function isBlankRole(role: RoleFormValue): boolean {
  return (
    role.company.trim() === "" &&
    role.title.trim() === "" &&
    role.startDate.trim() === "" &&
    role.endDate.trim() === "" &&
    role.responsibilities.trim() === "" &&
    !role.isCurrent
  );
}

// DB row -> form values (prefill on return visits).
export function rowToFormValues(row: Profile | null): ProfileFormValues {
  if (!row) return EMPTY_FORM_VALUES;

  return {
    fullName: str(row.full_name),
    phone: str(row.phone),
    location: str(row.location),
    linkedinUrl: str(row.linkedin_url),
    portfolioUrl: str(row.portfolio_url),
    workAuthorization: str(row.work_authorization),
    currentTitle: str(row.current_title),
    experienceLevel: str(row.experience_level),
    yearsExperience: row.years_experience === null ? "" : String(row.years_experience),
    skills: row.skills ?? [],
    industries: row.industries ?? [],
    workExperience: (row.work_experience ?? []).map((role) => ({
      id: crypto.randomUUID(),
      company: str(role.company),
      title: str(role.title),
      startDate: str(role.startDate),
      endDate: str(role.endDate),
      isCurrent: role.isCurrent,
      responsibilities: str(role.responsibilities),
    })),
    degree: str(row.education?.degree),
    fieldOfStudy: str(row.education?.fieldOfStudy),
    institution: str(row.education?.institution),
    graduationYear:
      row.education?.graduationYear === undefined
        ? ""
        : String(row.education.graduationYear),
    jobTitlesSeeking: (row.job_titles_seeking ?? []).join(", "),
    remotePreference: str(row.remote_preference),
    salaryExpectation: str(row.salary_expectation),
    preferredLocations: (row.preferred_locations ?? []).join(", "),
  };
}

// Form values -> DB row. `id` and `email` come from the session, never the client.
export function formValuesToRow(
  values: ProfileFormValues,
  id: string,
  email: string | null,
): ProfileWrite {
  return {
    id,
    email,
    full_name: blankToNull(values.fullName),
    phone: blankToNull(values.phone),
    location: blankToNull(values.location),
    current_title: blankToNull(values.currentTitle),
    experience_level: values.experienceLevel || null,
    years_experience: parseYears(values.yearsExperience),
    skills: values.skills,
    industries: values.industries,
    work_experience: values.workExperience
      .filter((role) => !isBlankRole(role))
      .map((role) => ({
        company: role.company,
        title: role.title,
        startDate: role.startDate,
        endDate: role.isCurrent ? null : role.endDate || null,
        isCurrent: role.isCurrent,
        responsibilities: role.responsibilities,
      })),
    education: {
      degree: values.degree || undefined,
      fieldOfStudy: blankToNull(values.fieldOfStudy) ?? undefined,
      institution: blankToNull(values.institution) ?? undefined,
      graduationYear: parseGradYear(values.graduationYear),
    },
    job_titles_seeking: splitCsv(values.jobTitlesSeeking),
    remote_preference: values.remotePreference || null,
    preferred_locations: splitCsv(values.preferredLocations),
    salary_expectation: blankToNull(values.salaryExpectation),
    linkedin_url: blankToNull(values.linkedinUrl),
    portfolio_url: blankToNull(values.portfolioUrl),
    work_authorization: values.workAuthorization || null,
  };
}

// The subset of columns the completion model reads. Both `Profile` and
// `ProfileWrite` satisfy it structurally, so the page (has a row) and the action
// (builds a row) share one implementation.
export type CompletionInput = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[];
  work_experience: WorkExperienceEntry[];
  education: Education;
};

// 10 equally-weighted required fields. Missing any keeps `is_complete` false;
// the labels drive the banner's missing-field pills. `is_complete` is the only
// persisted completion state — percentage and labels are always derived here.
const REQUIRED_FIELDS: { label: string; present: (p: CompletionInput) => boolean }[] = [
  { label: "Name", present: (p) => str(p.full_name).trim() !== "" },
  { label: "Email", present: (p) => str(p.email).trim() !== "" },
  { label: "Phone", present: (p) => str(p.phone).trim() !== "" },
  { label: "Location", present: (p) => str(p.location).trim() !== "" },
  { label: "Job Title", present: (p) => str(p.current_title).trim() !== "" },
  { label: "Experience Level", present: (p) => str(p.experience_level).trim() !== "" },
  { label: "Experience", present: (p) => p.years_experience !== null },
  { label: "Skills", present: (p) => p.skills.length > 0 },
  {
    label: "Work History",
    present: (p) => p.work_experience.some((role) => str(role.company).trim() !== ""),
  },
  { label: "Education", present: (p) => str(p.education?.institution).trim() !== "" },
];

// Email is required but never editable — it reaches the row only on first save,
// so it is seeded from the session. Without this a brand-new user would see an
// EMAIL missing-field pill next to an already-filled email input.
export function toCompletionInput(
  row: Profile | null,
  sessionEmail: string | null,
): CompletionInput {
  return {
    full_name: row?.full_name ?? null,
    email: row?.email ?? sessionEmail,
    phone: row?.phone ?? null,
    location: row?.location ?? null,
    current_title: row?.current_title ?? null,
    experience_level: row?.experience_level ?? null,
    years_experience: row?.years_experience ?? null,
    skills: row?.skills ?? [],
    work_experience: row?.work_experience ?? [],
    education: row?.education ?? {},
  };
}

export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

export function getProfileCompletion(input: CompletionInput): ProfileCompletion {
  const present = REQUIRED_FIELDS.filter((field) => field.present(input));
  const percentage = Math.round((present.length / REQUIRED_FIELDS.length) * 100);
  const missingFields = REQUIRED_FIELDS.filter((field) => !field.present(input)).map(
    (field) => field.label,
  );

  return {
    percentage,
    missingFields,
    isComplete: present.length === REQUIRED_FIELDS.length,
  };
}
