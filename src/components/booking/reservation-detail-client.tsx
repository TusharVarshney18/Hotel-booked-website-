"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PriceSummary } from "@/components/booking/price-summary";
import { Container, Eyebrow } from "@/components/site/container";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import type { Reservation } from "@/lib/types";

export function ReservationDetailClient({ id }: { id: string }) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ reservation: Reservation }>(`/api/reservations/${id}`)
      .then((data) => setReservation(data.reservation))
      .catch(() => setReservation(null))
      .finally(() => setReady(true));
  }, [id]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24 text-sm uppercase tracking-[0.22em] text-muted-foreground">
        Finding the folio
      </div>
    );
  }

  if (!reservation) {
    return (
      <Container className="pt-32 pb-20">
        <h1 className="font-display text-4xl">Folio not found</h1>
      </Container>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Eyebrow>{reservation.status}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl">{reservation.hotelName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {reservation.id} · {reservation.location}
          </p>
          <div className="relative mt-8 aspect-[16/9]">
            <Image
              src={reservation.hotelImage}
              alt={reservation.hotelName}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Stay
              </dt>
              <dd className="mt-1">
                {formatDate(reservation.checkIn)} — {formatDate(reservation.checkOut)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Chamber
              </dt>
              <dd className="mt-1">{reservation.roomName}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Guests
              </dt>
              <dd className="mt-1">
                {reservation.guests.adults} adults
                {reservation.guests.children
                  ? `, ${reservation.guests.children} children`
                  : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Guest of record
              </dt>
              <dd className="mt-1">
                {reservation.guest.title} {reservation.guest.firstName}{" "}
                {reservation.guest.lastName}
              </dd>
            </div>
          </dl>
          {reservation.guest.specialRequests ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Note: {reservation.guest.specialRequests}
            </p>
          ) : null}
          {reservation.status === "cancelled" ? (
            <p className="mt-8 border border-border bg-card p-5 text-sm">
              Cancelled{" "}
              {reservation.cancelledAt
                ? formatDate(reservation.cancelledAt)
                : ""}
              . Refund of{" "}
              {reservation.refundAmount
                ? formatINR(reservation.refundAmount)
                : "—"}{" "}
              is instructed to the original method.
            </p>
          ) : null}
        </div>
        <aside>
          <div className="border border-border bg-card p-6">
            <PriceSummary
              roomName={reservation.roomName}
              roomPrice={reservation.roomTotal / reservation.nights}
              nights={reservation.nights}
              extras={reservation.extras}
              roomTotal={reservation.roomTotal}
              extrasTotal={reservation.extrasTotal}
              taxes={reservation.taxes}
              total={reservation.total}
            />
            {reservation.status === "confirmed" ? (
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/reservations/${reservation.id}/cancel`}
                  className="inline-flex h-12 items-center justify-center border border-border text-[11px] uppercase tracking-[0.22em]"
                >
                  Cancel this stay
                </Link>
                <Link
                  href={`/concierge?reservation=${reservation.id}`}
                  className="inline-flex h-12 items-center justify-center bg-espresso text-[11px] uppercase tracking-[0.22em] text-ivory"
                >
                  Amend via concierge
                </Link>
              </div>
            ) : null}
          </div>
        </aside>
      </Container>
    </div>
  );
}
