import { CTAButtons } from "@/components/homepage/CTAButtons";

export function CTASection() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 pb-6">
      <div className="bg-hero-gradient rounded-2xl px-8 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-4xl leading-tight font-bold text-text-primary md:text-5xl">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-text-secondary">
          Set up your profile, upload your resume, and start finding matches
          in minutes.
        </p>
        <div className="mt-8 flex justify-center">
          <CTAButtons />
        </div>
      </div>
    </section>
  );
}
