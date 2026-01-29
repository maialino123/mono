import { TVLChart } from "@/widgets/tvl-chart";

export function StakeScreen() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TVLChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="flex h-full min-h-[460px] items-center justify-center rounded-xl border bg-card p-6">
            <p className="text-muted-foreground text-sm">Staking panel coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
