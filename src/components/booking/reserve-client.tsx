"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangeField } from "@/components/booking/date-range-field";
import { GuestField } from "@/components/booking/guest-field";
import { PriceSummary } from "@/components/booking/price-summary";
import { BookingSteps } from "@/components/booking/steps";
import { useBookings } from "@/components/booking/booking-provider";
import { Container, Eyebrow } from "@/components/site/container";
import { api } from "@/lib/api";
import { formatINR, toISODate } from "@/lib/format";
import type { GuestCount, Hotel, Quote } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReserveClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { setDraft } = useBookings();
  const slug = params.get("hotel") ?? "jal-mahal";
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(params.get("room") ?? "");
  const [range, setRange] = useState<DateRange | undefined>({
    from: params.get("checkIn")
      ? new Date(params.get("checkIn") as string)
      : addDays(new Date(), 14),
    to: params.get("checkOut")
      ? new Date(params.get("checkOut") as string)
      : addDays(new Date(), 18),
  });
  const [guests, setGuests] = useState<GuestCount>({
    adults: Number(params.get("adults") ?? 2),
    children: Number(params.get("children") ?? 0),
  });
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);

  const room =
    hotel?.rooms.find((item) => item.id === roomId) ?? hotel?.rooms[0];

  useEffect(() => {
    if (!range?.from || !range?.to) return;
    const query = new URLSearchParams({
      checkIn: toISODate(range.from),
      checkOut: toISODate(range.to),
    });
    setLoading(true);
    api<{ hotel: Hotel }>(`/api/hotels/${slug}?${query.toString()}`)
      .then((data) => {
        setHotel(data.hotel);
        setRoomId((current) =>
          data.hotel.rooms.some((item) => item.id === current)
            ? current
            : data.hotel.rooms[0]?.id ?? ""
        );
      })
      .catch(() => setHotel(null))
      .finally(() => setLoading(false));
  }, [range?.from, range?.to, slug]);

  useEffect(() => {
    if (!hotel || !room || !range?.from || !range?.to) return;
    api<{ quote: Quote }>("/api/quote", {
      method: "POST",
      body: JSON.stringify({
        hotelSlug: hotel.slug,
        roomId: room.id,
        checkIn: toISODate(range.from),
        checkOut: toISODate(range.to),
        extraIds,
      }),
    })
      .then((data) => setQuote(data.quote))
      .catch(() => setQuote(null));
  }, [extraIds, hotel, range?.from, range?.to, room]);

  function toggleExtra(id: string, checked: boolean) {
    setExtraIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    );
  }

  function continueToPayment() {
    if (!hotel || !room || !range?.from || !range?.to || !quote) {
      toast.error("Please choose arrival and departure.");
      return;
    }
    if (guests.adults + guests.children > room.occupancy) {
      toast.error(`This chamber sleeps ${room.occupancy}.`);
      return;
    }
    if (room.available === false) {
      toast.error("Those dates have already been spoken for.");
      return;
    }
    setDraft({
      hotelSlug: hotel.slug,
      roomId: room.id,
      checkIn: toISODate(range.from),
      checkOut: toISODate(range.to),
      guests,
      extraIds,
    });
    router.push("/checkout");
  }

  if (loading && !hotel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24 text-sm uppercase tracking-[0.22em] text-muted-foreground">
        Consulting the house
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <Container className="pt-32 pb-20">
        <p>That residence is no longer in the book.</p>
      </Container>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <Container>
        <BookingSteps current={0} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Reserve</Eyebrow>
            <h1 className="mt-3 font-display text-5xl">{hotel.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{hotel.location}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <DateRangeField range={range} onChange={setRange} />
              <GuestField guests={guests} onChange={setGuests} />
            </div>

            <div className="mt-10">
              <h2 className="font-display text-3xl">Chamber</h2>
              <div className="mt-5 space-y-3">
                {hotel.rooms.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.available === false}
                    onClick={() => setRoomId(item.id)}
                    className={cn(
                      "grid w-full gap-4 border p-4 text-left sm:grid-cols-[120px_1fr] disabled:opacity-40",
                      roomId === item.id ? "border-espresso" : "border-border"
                    )}
                  >
                    <div className="relative h-24">
                      <Image
                        src={item.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-2xl">{item.name}</p>
                        <p className="text-sm">{formatINR(item.price)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.size} · sleeps {item.occupancy}
                        {item.available === false ? " · held for those dates" : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="font-display text-3xl">To be arranged</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Optional. Added once, for the stay.
              </p>
              <ul className="mt-5 space-y-3">
                {hotel.extras.map((extra) => {
                  const checked = extraIds.includes(extra.id);
                  return (
                    <li
                      key={extra.id}
                      className="flex items-start gap-4 border border-border p-4"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleExtra(extra.id, value === true)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p>{extra.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {extra.description}
                        </p>
                      </div>
                      <p className="text-sm">{formatINR(extra.price)}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-card p-6">
              <div className="relative mb-5 aspect-[16/10]">
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              {quote ? (
                <PriceSummary
                  roomName={quote.room.name}
                  roomPrice={quote.room.price}
                  nights={quote.nights}
                  extras={quote.extras}
                  roomTotal={quote.roomTotal}
                  extrasTotal={quote.extrasTotal}
                  taxes={quote.taxes}
                  total={quote.total}
                />
              ) : null}
              <Button
                onClick={continueToPayment}
                disabled={room.available === false}
                className="mt-6 h-12 w-full rounded-none bg-gold text-[11px] tracking-[0.24em] text-espresso uppercase hover:bg-gold-muted"
              >
                {room.available === false
                  ? "Those dates are held"
                  : "Continue to payment"}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Price and availability are confirmed by the house at payment.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
