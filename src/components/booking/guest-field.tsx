"use client";

import { Minus, Plus, Users } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { GuestCount } from "@/lib/types";
import { cn } from "@/lib/utils";

function Counter({
  label,
  hint,
  value,
  min,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-none"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="w-5 text-center text-sm">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-none"
          onClick={() => onChange(value + 1)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function GuestField({
  guests,
  onChange,
  className,
}: {
  guests: GuestCount;
  onChange: (guests: GuestCount) => void;
  className?: string;
}) {
  const label = `${guests.adults} adult${guests.adults === 1 ? "" : "s"}${
    guests.children
      ? `, ${guests.children} child${guests.children === 1 ? "" : "ren"}`
      : ""
  }`;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-left text-sm transition-colors hover:border-gold/40",
          className
        )}
      >
        <Users className="size-4 text-gold" />
        <span>{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-5 p-5">
        <Counter
          label="Adults"
          hint="Twelve years and above"
          value={guests.adults}
          min={1}
          onChange={(adults) => onChange({ ...guests, adults })}
        />
        <Counter
          label="Children"
          hint="Younger than twelve"
          value={guests.children}
          min={0}
          onChange={(children) => onChange({ ...guests, children })}
        />
      </PopoverContent>
    </Popover>
  );
}
