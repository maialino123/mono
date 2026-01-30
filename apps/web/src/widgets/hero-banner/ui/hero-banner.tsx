interface HeroBannerProps {
  heading: string;
  pills: readonly string[];
}

export function HeroBanner({ heading, pills }: HeroBannerProps) {
  return (
    <section className="flex flex-col items-center gap-5 pt-4 pb-10 text-center">
      <h1 className="max-w-2xl font-semibold text-[30px] text-primary leading-[36px] tracking-[-0.0075em]">
        {heading}
      </h1>
      <div className="flex flex-wrap justify-center gap-3">
        {pills.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-border bg-secondary px-4 py-1.5 text-muted-foreground text-sm leading-5"
          >
            {pill}
          </span>
        ))}
      </div>
    </section>
  );
}
