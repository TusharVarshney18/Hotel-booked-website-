"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookingSteps } from "@/components/booking/steps";
import { Container, Eyebrow } from "@/components/site/container";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import type { Reservation } from "@/lib/types";

export function ConfirmationClient({ id }: { id: string }) {
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
        Writing the voucher
      </div>
    );
  }

  if (!reservation) {
    return (
      <Container className="pt-32 pb-20 text-center">
        <h1 className="font-display text-4xl">We cannot find that folio</h1>
        <Link
          href="/reservations"
          className="mt-8 inline-flex h-12 items-center bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
        >
          Reservations
        </Link>
      </Container>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <Container className="max-w-3xl">
        <BookingSteps current={2} />
        <Eyebrow className="mt-10">The house has your name</Eyebrow>
        <h1 className="mt-3 font-display text-5xl leading-tight">
          Reservation confirmed
        </h1>
        <p className="mt-4 text-muted-foreground">
          A letter has been imagined to {reservation.guest.email}. Present this
          folio upon arrival. The stay is now held in the house ledger.
        </p>

        <article className="mt-12 border border-gold/40 bg-card">
          <div className="relative aspect-[16/7]">
            <Image
              src={reservation.hotelImage}
              alt={reservation.hotelName}
              fill
              className="object-cover"
              sizes="800px"
            />
          </div>
          <div className="p-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
              {reservation.id}
            </p>
            <h2 className="mt-2 font-display text-4xl">
              {reservation.hotelName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {reservation.location}
            </p>
            <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Arrival
                </dt>
                <dd className="mt-1">{formatDate(reservation.checkIn)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Departure
                </dt>
                <dd className="mt-1">{formatDate(reservation.checkOut)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Chamber
                </dt>
                <dd className="mt-1">{reservation.roomName}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Guest
                </dt>
                <dd className="mt-1">
                  {reservation.guest.title} {reservation.guest.firstName}{" "}
                  {reservation.guest.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Payment
                </dt>
                <dd className="mt-1 capitalize">
                  {reservation.payment.method}
                  {reservation.payment.last4
                    ? ` · •••• ${reservation.payment.last4}`
                    : ""}{" "}
                  · {formatINR(reservation.total)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1 capitalize">{reservation.status}</dd>
              </div>
            </dl>
          </div>
        </article>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/reservations/${reservation.id}`}
            className="inline-flex h-12 items-center bg-espresso px-6 text-[11px] uppercase tracking-[0.22em] text-ivory"
          >
            Manage reservation
          </Link>
          <Link
            href={`/reservations/${reservation.id}/cancel`}
            className="inline-flex h-12 items-center border border-border px-6 text-[11px] uppercase tracking-[0.22em]"
          >
            Review cancellation
          </Link>
        </div>
      </Container>
    </div>
  );
}
