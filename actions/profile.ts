"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getPostHogClient } from "@/lib/posthog-server";
import {
  formValuesToRow,
  getProfileCompletion,
  type ProfileFormValues,
} from "@/lib/profile";

export type SaveProfileResult = { success: boolean; error?: string };

const GENERIC_ERROR = "Could not save your profile. Please try again.";
const RESUME_ERROR = "Could not save your resume. Please try again.";
const SIGNED_OUT_ERROR = "You need to be signed in to save your profile.";

export async function saveProfile(
  values: ProfileFormValues,
): Promise<SaveProfileResult> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();
    const user = userData.user;
    if (!user) {
      return { success: false, error: SIGNED_OUT_ERROR };
    }

    // Prior completion state, so `profile_completed` fires only on the
    // false -> true transition (never re-fires when re-saving a complete profile).
    const { data: existing } = await insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id);
    const wasComplete = existing?.[0]?.is_complete === true;

    const row = formValuesToRow(values, user.id, user.email ?? null);
    const { isComplete } = getProfileCompletion(row);

    const { error } = await insforge.database
      .from("profiles")
      .upsert([{ ...row, is_complete: isComplete }], { onConflict: "id" });

    if (error) {
      console.error("[actions/profile]", error);
      return { success: false, error: GENERIC_ERROR };
    }

    if (!wasComplete && isComplete) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "profile_completed",
        properties: { userId: user.id },
      });
      await posthog.flush();
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[actions/profile]", err);
    return { success: false, error: GENERIC_ERROR };
  }
}

// The file itself is uploaded by the browser client (Storage RLS authorises it
// against the signed-in user, and a Server Action's 1MB body limit could not
// carry a 5MB PDF). This only persists the resulting pointer.
export async function saveResume(
  url: string,
  key: string,
): Promise<SaveProfileResult> {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();
    const user = userData.user;
    if (!user) {
      return { success: false, error: SIGNED_OUT_ERROR };
    }

    // Ownership is the first path segment of the key — same predicate the
    // storage.objects RLS policy enforces. The client supplies the key, so it
    // is re-checked here rather than trusted.
    if (!key.startsWith(`${user.id}/`)) {
      console.error("[actions/profile] rejected resume key outside user prefix");
      return { success: false, error: RESUME_ERROR };
    }

    const { data: existing } = await insforge.database
      .from("profiles")
      .select("resume_pdf_key")
      .eq("id", user.id);
    const previousKey: string | null = existing?.[0]?.resume_pdf_key ?? null;

    // Upsert, not update: the resume may be uploaded before the form is ever
    // saved, and every other column is nullable or defaulted.
    const { error } = await insforge.database
      .from("profiles")
      .upsert([{ id: user.id, resume_pdf_url: url, resume_pdf_key: key }], {
        onConflict: "id",
      });

    if (error) {
      console.error("[actions/profile]", error);
      return { success: false, error: RESUME_ERROR };
    }

    // Uploads never overwrite — the backend auto-renames on key collision — so
    // the superseded object is removed after the new pointer is safely stored.
    // Removal failing leaves an orphan, not a broken profile, so it never fails
    // the save.
    if (previousKey && previousKey !== key) {
      const { error: removeError } = await insforge.storage
        .from("resumes")
        .remove(previousKey);
      if (removeError) {
        console.error("[actions/profile] stale resume not removed", removeError);
      }
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[actions/profile]", err);
    return { success: false, error: RESUME_ERROR };
  }
}
