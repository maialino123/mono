import { cn } from "@/shared/lib";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/shadcn/accordion";

interface CustomAccordionItemProps {
  value: string;
  children: React.ReactNode;
  themeValue?: string;
  triggerSlot?: React.ReactNode;
}

export const CustomAccordionItem = ({ value, children, themeValue, triggerSlot }: CustomAccordionItemProps) => {
  return (
    <AccordionItem
      className="overflow-visible rounded-[8px] border border-[#E2E8F0] border-b border-b-[#E2E8F0] bg-white last:border-b! dark:border-gray-700 dark:border-b-gray-700 dark:bg-gray-900"
      value={value}
    >
      <AccordionTrigger className="flex cursor-pointer px-4 py-3 hover:no-underline focus:no-underline">
        <div className="font-medium text-base text-slate-600 capitalize leading-6 dark:text-slate-300">{value}</div>
        {triggerSlot ? (
          <div className="ml-auto h-full">{triggerSlot}</div>
        ) : (
          <div className="ml-auto font-medium text-base text-slate-600 capitalize leading-6 dark:text-slate-300">
            {themeValue}
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent
        className={cn(
          "overflow-visible pb-4 text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        )}
      >
        <div className="overflow-visible">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
};
