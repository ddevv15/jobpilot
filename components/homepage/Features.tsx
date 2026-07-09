import Image from "next/image";

const items = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div className="rounded-2xl bg-surface-tertiary p-6 md:order-1">
          <Image
            src="/images/agnet-log.png"
            alt="JobPilot agent activity log"
            width={2144}
            height={1656}
            className="h-auto w-full"
          />
        </div>

        <div className="md:order-2">
          <h2 className="text-4xl leading-tight font-bold text-text-primary">
            Apply With More
            <br />
            Confidence, Every Time
          </h2>
          <div className="mt-10 divide-y divide-border border-t border-border">
            {items.map((item, index) => (
              <div
                key={item.title}
                className={`border-l-2 py-6 pl-6 ${
                  index === 1 ? "border-success" : "border-border"
                }`}
              >
                <h3 className="text-base font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
