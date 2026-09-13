"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangeField } from "@/components/booking/date-range-field";
import { GuestField } from "@/components/booking/guest-field";
import { api } from "@/lib/api";
import { formatINR, nightsBetween, toISODate } from "@/lib/format";
import type { GuestCount, Hotel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HotelBookingPanel({ hotel }: { hotel: Hotel }) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 14),
    to: addDays(new Date(), 18),
  });
  const [guests, setGuests] = useState<GuestCount>({ adults: 2, children: 0 });
  const [rooms, setRooms] = useState(hotel.rooms);
  const [roomId, setRoomId] = useState(hotel.rooms[0]?.id ?? "");
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const nights =
    range?.from && range?.to
      ? nightsBetween(toISODate(range.from), toISODate(range.to))
      : 4;
  const subtotal = room ? room.price * nights : 0;
  const taxes = Math.round(subtotal * 0.18);
  const available = room?.available !== false;

  useEffect(() => {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams({
      checkIn: toISODate(range.from),
      checkOut: toISODate(range.to),
    });
    api<{ hotel: Hotel }>(`/api/hotels/${hotel.slug}?${params.toString()}`)
      .then((data) => {
        setRooms(data.hotel.rooms);
        if (!data.hotel.rooms.some((item) => item.id === roomId)) {
          setRoomId(data.hotel.rooms[0]?.id ?? "");
        }
      })
      .catch(() => null);
  }, [hotel.slug, range?.from, range?.to, roomId]);

  function continueReserve() {
    if (!range?.from || !range?.to || !room) return;
    const params = new URLSearchParams({
      hotel: hotel.slug,
      room: room.id,
      checkIn: toISODate(range.from),
      checkOut: toISODate(range.to),
      adults: String(guests.adults),
      children: String(guests.children),
    });
    router.push(`/reserve?${params.toString()}`);
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.7)] lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">
              From {formatINR(hotel.priceFrom)}
            </p>
            <p className="text-sm text-muted-foreground">per night, chamber only</p>
          </div>
          <p className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-gold text-gold" />
            {hotel.rating.toFixed(2)}
            <span className="text-muted-foreground">({hotel.reviewCount})</span>
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <DateRangeField range={range} onChange={setRange} />
          <GuestField guests={guests} onChange={setGuests} />
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Chamber
          </p>
          {rooms.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoomId(item.id)}
              disabled={item.available === false}
              className={cn(
                "flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition-colors disabled:opacity-40",
                roomId === item.id
                  ? "border-espresso bg-espresso text-ivory"
                  : "border-border hover:border-gold/50"
              )}
            >
              <span>
                {item.name}
                {item.available === false ? " · held" : ""}
              </span>
              <span>{formatINR(item.price)}</span>
            </button>
          ))}
        </div>

        <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              {formatINR(room?.price ?? 0)} × {nights} nights
            </dt>
            <dd>{formatINR(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Taxes & levies (18%)</dt>
            <dd>{formatINR(taxes)}</dd>
          </div>
          <div className="flex justify-between pt-2 font-medium">
            <dt>Indicative total</dt>
            <dd>{formatINR(subtotal + taxes)}</dd>
          </div>
        </dl>

        <Button
          onClick={continueReserve}
          disabled={!available}
          className="mt-6 h-12 w-full rounded-full bg-gold text-[13px] font-semibold text-espresso hover:bg-gold-muted"
        >
          {available ? "Continue to reserve" : "Those dates are held"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Availability is live. You will not be charged until payment is confirmed.
        </p>
      </div>
    </aside>
  );
}
