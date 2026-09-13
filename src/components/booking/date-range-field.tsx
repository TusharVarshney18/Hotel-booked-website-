"use client";

import { format } from "date-fns";
import { CalendarRange } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangeField({
  range,
  onChange,
  className,
  align = "start",
}: {
  range?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const label =
    range?.from && range?.to
      ? `${format(range.from, "dd MMM")} — ${format(range.to, "dd MMM yyyy")}`
      : range?.from
        ? `${format(range.from, "dd MMM")} — departure`
        : "Select dates";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-left text-sm transition-colors hover:border-gold/40",
          className
        )}
      >
        <CalendarRange className="size-4 text-gold" />
        <span className={range?.from ? "text-foreground" : "text-muted-foreground"}>
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto max-w-[calc(100vw-2rem)] p-3"
      >
        <Calendar
          mode="range"
          selected={range}
          onSelect={onChange}
          numberOfMonths={2}
          disabled={{ before: new Date() }}
          defaultMonth={range?.from}
        />
      </PopoverContent>
    </Popover>
  );
}
