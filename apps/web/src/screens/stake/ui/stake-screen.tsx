import { StakeModule } from "@/widgets/stake-module";
import { TVLChart } from "@/widgets/tvl-chart";

const PILLS = ["1:1 Backed", "On Base", "Fully On-chain"] as const;

export function StakeScreen() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <section className="flex flex-col items-center gap-5 pt-4 pb-10 text-center">
        <h1 className="max-w-2xl font-semibold text-[30px] text-primary leading-[36px] tracking-[-0.0075em]">
          Every CUSD is backed by real assets in Treasury
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          {PILLS.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-border bg-secondary px-4 py-1.5 text-muted-foreground text-sm leading-5"
            >
              {pill}
            </span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TVLChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <StakeModule />
        </div>
      </div>
    </div>
  );
}
