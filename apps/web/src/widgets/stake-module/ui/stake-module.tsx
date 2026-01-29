"use client";

import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/tabs";
import { StakeTab } from "./stake-tab";
import { UnstakeTab } from "./unstake-tab";
import { WithdrawTab } from "./withdraw-tab";

interface StakeModuleProps {
  className?: string;
}

export function StakeModule({ className }: StakeModuleProps) {
  return (
    <Card
      className={cn(
        "mx-auto w-full min-w-[320px] overflow-hidden rounded-2xl border border-[#E2E8F0] p-6 ring-0",
        className,
      )}
    >
      <CardContent className="p-0">
        <Tabs className="m-0" defaultValue="stake">
          <TabsList className="m-0 mb-3 w-fit rounded-[6px]">
            <TabsTrigger
              value="stake"
              className="flex-1 rounded-[3px] px-3 py-[6px] font-medium text-muted-foreground text-sm/5 data-active:border-[#DCE0E6] data-active:text-primary"
            >
              Stake
            </TabsTrigger>
            <TabsTrigger
              value="unstake"
              className="flex-1 rounded-[3px] px-3 py-[6px] font-medium text-muted-foreground text-sm/5 data-active:border-[#DCE0E6] data-active:text-primary"
            >
              Unstake
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="flex-1 rounded-[3px] px-3 py-[6px] font-medium text-muted-foreground text-sm/5 data-active:border-[#DCE0E6] data-active:text-primary"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stake">
            <StakeTab />
          </TabsContent>
          <TabsContent value="unstake">
            <UnstakeTab />
          </TabsContent>
          <TabsContent value="withdraw">
            <WithdrawTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
