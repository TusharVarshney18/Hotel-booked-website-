"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBookings } from "@/components/booking/booking-provider";
import { Container, Eyebrow } from "@/components/site/container";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import {
  calculateRefund,
  CANCELLATION_TIERS,
} from "@/lib/policies";
import type { Reservation } from "@/lib/types";
import { cn } from "@/lib/utils";

const reasons = [
  "Change of dates",
  "Travel no longer possible",
  "Found another house",
  "A personal matter",
  "Other",
];

export function CancelClient({ id }: { id: string }) {
  const router = useRouter();
  const { refreshReservations } = useBookings();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [ready, setReady] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    api<{ reservation: Reservation }>(`/api/reservations/${id}`)
      .then((data) => setReservation(data.reservation))
      .catch(() => setReservation(null))
      .finally(() => setReady(true));
  }, [id]);

  const refund = useMemo(() => {
    if (!reservation) return null;
    return calculateRefund({
      checkIn: reservation.checkIn,
      roomTotal: reservation.roomTotal,
      extrasTotal: reservation.extrasTotal,
      taxes: reservation.taxes,
    });
  }, [reservation]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24 text-sm uppercase tracking-[0.22em] text-muted-foreground">
        Reading the policy
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

  if (reservation.status === "cancelled") {
    return (
      <Container className="pt-32 pb-20">
        <h1 className="font-display text-4xl">Already released</h1>
        <p className="mt-3 text-muted-foreground">
          This stay was cancelled. The refund has been instructed.
        </p>
        <Link
          href={`/reservations/${reservation.id}`}
          className="mt-8 inline-flex h-12 items-center bg-espresso px-6 text-[11px] uppercase tracking-[0.22em] text-ivory"
        >
          View folio
        </Link>
      </Container>
    );
  }

  async function confirm() {
    if (!reservation || !refund) return;
    setConfirming(true);
    const detail = note ? `${reason} — ${note}` : reason;
    try {
      await api(`/api/reservations/${reservation.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: detail }),
      });
      await refreshReservations();
      toast.success("The house has released the chamber.");
      router.push(`/reservations/${reservation.id}`);
    } catch (error) {
      setConfirming(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "The house could not release the chamber."
      );
    }
  }

  return (
    <div className="pt-24 pb-20">
      <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Eyebrow>Release the chamber</Eyebrow>
          <h1 className="mt-3 font-display text-5xl">Cancellation</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {reservation.hotelName} · {formatDate(reservation.checkIn)} —{" "}
            {formatDate(reservation.checkOut)}. The house policy is applied to
            the night of arrival, from today.
          </p>

          <ol className="mt-10 space-y-4">
            {CANCELLATION_TIERS.map((tier) => (
              <li
                key={tier.label}
                className={cn(
                  "border p-5",
                  refund?.percent === tier.percent
                    ? "border-espresso bg-card"
                    : "border-border"
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                  {tier.percent}% of the stay
                </p>
                <p className="mt-1 font-display text-2xl">{tier.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tier.detail}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <p className="text-sm">A reason, if you wish to leave one</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reasons.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={cn(
                    "h-9 px-4 text-[11px] uppercase tracking-[0.16em]",
                    reason === item
                      ? "bg-espresso text-ivory"
                      : "border border-border"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <Textarea
              className="mt-4 min-h-24 rounded-none"
              placeholder="A line for the house, optional."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border bg-card p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
              Refund to original method
            </p>
            {refund ? (
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stay ({refund.percent}%)</dt>
                  <dd>{formatINR(refund.stayRefund)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Unused extras</dt>
                  <dd>{formatINR(refund.extrasRefund)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Taxes</dt>
                  <dd>{formatINR(refund.taxRefund)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt>You receive</dt>
                  <dd>{formatINR(refund.amount)}</dd>
                </div>
                <p className="text-xs text-muted-foreground">
                  {refund.daysUntil >= 0
                    ? `${refund.daysUntil} days remain before arrival.`
                    : "Arrival has passed."}
                </p>
              </dl>
            ) : null}
            <Button
              onClick={confirm}
              disabled={confirming}
              className="mt-6 h-12 w-full rounded-none bg-espresso text-[11px] tracking-[0.22em] text-ivory uppercase"
            >
              Confirm cancellation
            </Button>
            <Link
              href={`/reservations/${reservation.id}`}
              className="mt-3 inline-flex h-11 w-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Keep the stay
            </Link>
          </div>
        </aside>
      </Container>
    </div>
  );
}
