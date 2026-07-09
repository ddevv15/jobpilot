import Image from "next/image";

export function Testimonial() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20 text-center">
      <p className="text-xs font-semibold tracking-widest text-accent uppercase">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-6 max-w-3xl text-2xl leading-snug font-medium text-text-primary md:text-3xl">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3
        offers on the table simultaneously.&rdquo;
      </blockquote>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={192}
          height={192}
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div className="text-left">
          <p className="text-sm font-bold text-text-primary">Tom Wilson</p>
          <p className="text-sm text-text-secondary">Junior Developer</p>
        </div>
      </div>
    </section>
  );
}
