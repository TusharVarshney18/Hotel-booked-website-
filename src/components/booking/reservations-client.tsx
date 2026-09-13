"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useBookings } from "@/components/booking/booking-provider";
import { Container, Eyebrow } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { reservations, ready, session, requestSignIn, signOut } = useBookings();
  const [filter, setFilter] = useState<"all" | ReservationStatus>("all");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const list = useMemo(
    () =>
      filter === "all"
        ? reservations
        : reservations.filter((item) => item.status === filter),
    [filter, reservations]
  );

  async function sendLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const result = await requestSignIn(email);
      setSent(true);
      setPreviewUrl(result.previewUrl ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The link could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pt-24 pb-20">
      <Container>
        <Eyebrow>The ledger</Eyebrow>
        <h1 className="mt-3 font-display text-5xl">Reservations</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Stays held in the house ledger. Sign in with the email on your folio
          to gather every reservation, on any device.
        </p>

        {session ? (
          <div className="mt-8 flex flex-wrap items-center gap-4 border border-border bg-card p-5">
            <p className="text-sm">
              Signed in as <span className="text-gold">{session.email}</span>
            </p>
            <button
              type="button"
              onClick={() => signOut().catch(() => null)}
              className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-8 border border-border bg-card p-6">
            {sent ? (
              <div>
                <p className="text-sm">
                  If a folio exists for {email}, a sign-in link is on its way.
                  The link expires in 15 minutes.
                </p>
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    className="mt-3 inline-block break-all text-xs text-gold underline"
                  >
                    Development link: {previewUrl}
                  </a>
                ) : null}
              </div>
            ) : (
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={sendLink}
              >
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="Email on the folio"
                  className="h-12 flex-1 rounded-none"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button
                  type="submit"
                  disabled={sending}
                  className="h-12 rounded-none bg-espresso px-6 text-[11px] uppercase tracking-[0.2em] text-ivory"
                >
                  {sending ? "Sending" : "Email me a link"}
                </Button>
              </form>
            )}
          </div>
        )}

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
