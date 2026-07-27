import { type JSX } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  getProfileCompletion,
  rowToFormValues,
  toCompletionInput,
} from "@/lib/profile";
import type { Profile } from "@/types";

export default async function ProfilePage(): Promise<JSX.Element> {
  const insforge = await createInsforgeServer();

  let userId: string | null = null;
  let email = "";
  let profile: Profile | null = null;

  try {
    const { data } = await insforge.auth.getCurrentUser();
    userId = data.user?.id ?? null;
    email = data.user?.email ?? "";

    if (userId) {
      const { data: rows, error } = await insforge.database
        .from("profiles")
        .select("*")
        .eq("id", userId);

      if (error) {
        console.error("[profile/page]", error);
      }
      // The PostgREST client is untyped here — this project has no generated
      // database types, so the row shape is asserted against types/index.ts.
      profile = (rows?.[0] as Profile | undefined) ?? null;
    }
  } catch (error) {
    console.error("[profile/page]", error);
  }

  // Outside the try — redirect() signals by throwing, which a catch would
  // swallow and log as a false error.
  if (!userId) redirect("/login");

  const completion = getProfileCompletion(toCompletionInput(profile, email));

  return (
    <>
      <Navbar variant="app" />
      <main className="flex-1 bg-background">
        <div className="mx-auto w-full max-w-2xl space-y-6 px-6 py-8">
          {!completion.isComplete && (
            <CompletionIndicator
              percentage={completion.percentage}
              missingFields={completion.missingFields}
            />
          )}
          <ResumeUpload
            userId={userId}
            resumeUrl={profile?.resume_pdf_url ?? null}
          />
          <ProfileForm email={email} initialValues={rowToFormValues(profile)} />
        </div>
      </main>
    </>
  );
}
