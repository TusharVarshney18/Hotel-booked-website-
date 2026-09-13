"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/site/container";
import { SearchBar } from "@/components/booking/search-bar";
import { HotelCard } from "@/components/hotels/hotel-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { CollectionKind, Destination, Hotel } from "@/lib/types";
import { cn } from "@/lib/utils";

const kinds: Array<CollectionKind | "All"> = [
  "All",
  "Palace",
  "Villa",
  "Chalet",
  "Ryokan",
  "Estate",
  "Atelier",
];

export function CollectionExplorer({
  initialHotels,
  destinations,
  initialDestination,
  checkIn,
  checkOut,
  adults,
  children,
}: {
  initialHotels: Hotel[];
  destinations: Destination[];
  initialDestination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
}) {
  const [kind, setKind] = useState<CollectionKind | "All">("All");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [hotels, setHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const destination = initialDestination;

  useEffect(() => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (kind !== "All") params.set("collection", kind);
    params.set("maxPrice", String(maxPrice));
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (adults) params.set("adults", adults);
    if (children) params.set("children", children);
    const controller = new AbortController();
    setLoading(true);
    api<{ hotels: Hotel[] }>(`/api/hotels?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((data) => setHotels(data.hotels))
      .catch(() => null)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [adults, checkIn, checkOut, children, destination, kind, maxPrice]);

  return (
    <>
      <Container>
        <SearchBar
          variant="page"
          destinations={destinations}
          defaultDestination={destination ?? "all"}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultAdults={adults ? Number(adults) : 2}
          defaultChildren={children ? Number(children) : 0}
        />
        <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-white/10 bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {kinds.map((item) => (
              <Button
                key={item}
                type="button"
                variant={kind === item ? "default" : "outline"}
                className={cn(
                  "h-9 rounded-full px-4 text-[11px] tracking-[0.16em] uppercase",
                  kind === item
                    ? "bg-gold text-espresso"
                    : "border-white/10 bg-transparent"
                )}
                onClick={() => setKind(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="min-w-[240px] lg:w-80">
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Up to {formatINR(maxPrice)} / night
            </p>
            <Slider
              min={80000}
              max={1000000}
              step={5000}
              value={[maxPrice]}
              onValueChange={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                setMaxPrice(next ?? 1000000);
              }}
            />
          </div>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {loading ? "Consulting the ledger…" : `${hotels.length} residence${hotels.length === 1 ? "" : "s"}`}
          {destination ? ` in ${destination}` : ""}
          {checkIn && checkOut ? " with those dates free" : ""}
        </p>
      </Container>
      <Container className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.slug} hotel={hotel} />
        ))}
      </Container>
      {!loading && hotels.length === 0 ? (
        <Container className="mt-16 text-center">
          <p className="font-display text-3xl">Nothing in that register</p>
          <p className="mt-2 text-muted-foreground">
            Widen the tariff or the dates — some chambers are already spoken for.
          </p>
        </Container>
      ) : null}
    </>
  );
}
