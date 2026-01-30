"use client";

import { cn } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/shadcn/tabs";
import { MintTab } from "./mint-tab";
import { RedeemTab } from "./redeem-tab";

interface MintModuleProps {
  className?: string;
}

export function MintModule({ className }: MintModuleProps) {
  return (
    <Card
      className={cn(
        "mx-auto w-full min-w-[320px] overflow-hidden rounded-2xl border border-[#E2E8F0] p-6 ring-0",
        className,
      )}
    >
      <CardContent className="p-0">
        <Tabs className="m-0" defaultValue="mint">
          <TabsList className="m-0 mb-3 w-fit rounded-[6px]">
            <TabsTrigger
              value="mint"
              className="flex-1 rounded-[3px] px-3 py-[6px] font-medium text-muted-foreground text-sm/5 data-active:border-[#DCE0E6] data-active:text-primary"
            >
              Mint
            </TabsTrigger>
            <TabsTrigger
              value="redeem"
              className="flex-1 rounded-[3px] px-3 py-[6px] font-medium text-muted-foreground text-sm/5 data-active:border-[#DCE0E6] data-active:text-primary"
            >
              Redeem
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mint">
            <MintTab />
          </TabsContent>
          <TabsContent value="redeem">
            <RedeemTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
