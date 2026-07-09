import Image from "next/image";
import { CTAButtons } from "@/components/homepage/CTAButtons";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 pt-6">
      <div className="bg-hero-gradient rounded-2xl px-8 py-20 text-center md:py-28">
        <h1 className="mx-auto max-w-3xl text-4xl leading-tight font-bold text-text-primary md:text-5xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-text-secondary">
          Stop applying blind. JobPilot finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <div className="mt-8 flex justify-center">
          <CTAButtons />
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-5xl px-4">
        <Image
          src="/images/dashboard-demo.png"
          alt="JobPilot dashboard preview"
          width={4788}
          height={2416}
          className="h-auto w-full"
          priority
        />
      </div>
    </section>
  );
}
