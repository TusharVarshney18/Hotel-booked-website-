"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangeField } from "@/components/booking/date-range-field";
import { GuestField } from "@/components/booking/guest-field";
import { api } from "@/lib/api";
import { toISODate } from "@/lib/format";
import type { Destination, GuestCount } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SearchBar({
  variant = "hero",
  defaultDestination = "all",
  destinations: initialDestinations = [],
  defaultCheckIn,
  defaultCheckOut,
  defaultAdults = 2,
  defaultChildren = 0,
}: {
  variant?: "hero" | "page";
  defaultDestination?: string;
  destinations?: Destination[];
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultAdults?: number;
  defaultChildren?: number;
}) {
  const router = useRouter();
  const [destinations, setDestinations] = useState(initialDestinations);
  const [destination, setDestination] = useState(defaultDestination);
  const [range, setRange] = useState<DateRange | undefined>({
    from: defaultCheckIn ? new Date(defaultCheckIn) : addDays(new Date(), 14),
    to: defaultCheckOut ? new Date(defaultCheckOut) : addDays(new Date(), 18),
  });
  const [guests, setGuests] = useState<GuestCount>({
    adults: defaultAdults,
    children: defaultChildren,
  });

  useEffect(() => {
    if (initialDestinations.length) return;
    api<{ destinations: Destination[] }>("/api/destinations")
      .then((data) => setDestinations(data.destinations))
      .catch(() => setDestinations([]));
  }, [initialDestinations.length]);

  function submit() {
    const params = new URLSearchParams();
    if (destination !== "all") params.set("destination", destination);
    if (range?.from) params.set("checkIn", toISODate(range.from));
    if (range?.to) params.set("checkOut", toISODate(range.to));
    params.set("adults", String(guests.adults));
    params.set("children", String(guests.children));
    router.push(`/collection?${params.toString()}`);
  }

  return (
    <div
      className={cn(
        "grid gap-3 p-3 sm:p-4 lg:grid-cols-[1.1fr_1.3fr_0.9fr_auto]",
        variant === "hero"
          ? "rounded-3xl border border-white/10 bg-black/45 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          : "rounded-3xl border border-white/10 bg-card"
      )}
    >
      <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4">
        <MapPin className="size-4 text-gold" />
        <select
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="h-full w-full bg-transparent text-sm outline-none"
        >
          <option value="all">Any residence</option>
          {destinations.map((item) => (
            <option key={item.city} value={item.city}>
              {item.city}, {item.country}
            </option>
          ))}
        </select>
      </label>
      <DateRangeField range={range} onChange={setRange} />
      <GuestField guests={guests} onChange={setGuests} />
      <Button
        onClick={submit}
        className="h-12 rounded-full bg-gold px-8 text-[12px] font-semibold text-espresso hover:bg-gold-muted"
      >
        <Search className="size-4" />
        Enquire
      </Button>
    </div>
  );
}
