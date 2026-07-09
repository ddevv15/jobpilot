import Image from "next/image";

const items = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-4xl leading-tight font-bold text-text-primary">
            Manage Your Job
            <br />
            Search With Ease
          </h2>
          <div className="mt-10 divide-y divide-border border-t border-border">
            {items.map((item, index) => (
              <div
                key={item.title}
                className={`border-l-2 py-6 pl-6 ${
                  index === 0 ? "border-accent" : "border-border"
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

        <div className="rounded-2xl bg-surface-tertiary p-6">
          <Image
            src="/images/jobs-lists.png"
            alt="Jobs matched to your profile"
            width={2364}
            height={1778}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
