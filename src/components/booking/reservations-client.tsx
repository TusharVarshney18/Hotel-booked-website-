"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useBookings } from "@/components/booking/booking-provider";
import { Container, Eyebrow } from "@/components/site/container";
import { formatDate, formatINR } from "@/lib/format";
import type { ReservationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: Array<{ id: "all" | ReservationStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Upcoming" },
  { id: "cancelled", label: "Cancelled" },
  { id: "completed", label: "Past" },
];

export function ReservationsClient() {
  const { reservations, ready, refreshReservations } = useBookings();
  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");
  const list = useMemo(
    () =>
      filter === "all"
        ? reservations
        : reservations.filter((item) => item.status === filter),
    [filter, reservations]
  );

  return (
    <div className="pt-24 pb-20">
      <Container>
        <Eyebrow>The ledger</Eyebrow>
        <h1 className="mt-3 font-display text-5xl">Reservations</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Stays held in the house ledger. Look up a folio by number or the email
          on the reservation. A sample stay is AUR-184720.
        </p>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            refreshReservations({
              folio: String(form.get("folio") || ""),
              email: String(form.get("email") || ""),
            }).catch(() => null);
          }}
        >
          <input
            name="folio"
            placeholder="AUR-000000"
            className="h-12 flex-1 border border-input bg-card px-3 text-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email on the folio"
            className="h-12 flex-1 border border-input bg-card px-3 text-sm"
          />
          <button
            type="submit"
            className="h-12 bg-espresso px-6 text-[11px] uppercase tracking-[0.2em] text-ivory"
          >
            Find
          </button>
        </form>
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "h-9 px-4 text-[11px] uppercase tracking-[0.2em]",
                filter === item.id
                  ? "bg-espresso text-ivory"
                  : "border border-border"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!ready ? (
          <p className="mt-16 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Opening the book
          </p>
        ) : list.length === 0 ? (
          <div className="mt-16 border border-border bg-card p-12 text-center">
            <p className="font-display text-3xl">The page is blank</p>
            <p className="mt-2 text-muted-foreground">
              No folios in this register.
            </p>
            <Link
              href="/collection"
              className="mt-6 inline-flex h-11 items-center bg-espresso px-6 text-[11px] uppercase tracking-[0.22em] text-ivory"
            >
              Reserve
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-5">
            {list.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/reservations/${item.id}`}
                  className="grid overflow-hidden border border-border bg-card md:grid-cols-[220px_1fr]"
                >
                  <div className="relative min-h-[160px]">
                    <Image
                      src={item.hotelImage}
                      alt={item.hotelName}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                        {item.id} · {item.status}
                      </p>
                      <h2 className="mt-1 font-display text-3xl">
                        {item.hotelName}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.roomName} · {formatDate(item.checkIn)} —{" "}
                        {formatDate(item.checkOut)}
                      </p>
                    </div>
                    <p className="mt-4 text-sm sm:mt-0">
                      {formatINR(item.total)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
