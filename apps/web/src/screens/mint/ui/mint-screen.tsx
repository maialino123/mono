import { HeroBanner } from "@/widgets/hero-banner";
import { MintModule } from "@/widgets/mint-module";
import { TVLChart } from "@/widgets/tvl-chart";

const HEADING = "Every CUSD is backed by real assets in Treasury";
const PILLS = ["1:1 Backed", "On Base", "Fully On-chain"] as const;

export function MintScreen() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <HeroBanner heading={HEADING} pills={PILLS} />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TVLChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MintModule />
        </div>
      </div>
    </div>
  );
}
