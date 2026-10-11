"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceSummary } from "@/components/booking/price-summary";
import { BookingSteps } from "@/components/booking/steps";
import { useBookings } from "@/components/booking/booking-provider";
import { Container, Eyebrow } from "@/components/site/container";
import { api } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import type { GuestDetails, Quote, Reservation } from "@/lib/types";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayCheckoutOptions = {
  key: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay is unavailable."));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Razorpay could not be loaded."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Razorpay could not be loaded."));
    document.body.appendChild(script);
  });
}

const emptyGuest: GuestDetails = {
  title: "Ms",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "India",
  specialRequests: "",
};

export function CheckoutClient() {
  const router = useRouter();
  const { draft, setDraft, ready, refreshReservations } = useBookings();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [guest, setGuest] = useState<GuestDetails>(emptyGuest);
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!draft) return;
    api<{ quote: Quote }>("/api/quote", {
      method: "POST",
      body: JSON.stringify(draft),
    })
      .then((data) => setQuote(data.quote))
      .catch(() => setQuote(null));
  }, [draft]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-24 text-sm uppercase tracking-[0.22em] text-muted-foreground">
        Opening the ledger
      </div>
    );
  }

  if (!draft || !quote) {
    return (
      <Container className="pt-32 pb-20 text-center">
        <h1 className="font-display text-4xl">No stay is held</h1>
        <p className="mt-3 text-muted-foreground">
          Begin with a residence, then we will take payment.
        </p>
        <Link
          href="/collection"
          className="mt-8 inline-flex h-12 items-center bg-espresso px-8 text-[11px] uppercase tracking-[0.22em] text-ivory"
        >
          The collection
        </Link>
      </Container>
    );
  }

  function field<K extends keyof GuestDetails>(key: K, value: GuestDetails[K]) {
    setGuest((current) => ({ ...current, [key]: value }));
  }

  function finish(reservation: Reservation) {
    setDraft(null);
    void refreshReservations();
    router.push(`/confirmation/${reservation.id}`);
  }

  async function pay() {
    if (!draft || !quote) return;
    if (!guest.firstName || !guest.lastName || !guest.email || !guest.phone) {
      toast.error("Please complete the guest folio.");
      return;
    }
    if (!agreed) {
      toast.error("The house asks that you accept the terms.");
      return;
    }

    setProcessing(true);
    try {
      const order = await api<{
        orderId: string;
        simulated: boolean;
        keyId: string;
      }>("/api/payments/order", {
        method: "POST",
        body: JSON.stringify({
          hotelSlug: draft.hotelSlug,
          roomId: draft.roomId,
          checkIn: draft.checkIn,
          checkOut: draft.checkOut,
          extraIds: draft.extraIds,
          guests: draft.guests,
          guest,
        }),
      });

      if (order.simulated) {
        const data = await api<{ reservation: Reservation }>(
          "/api/payments/verify",
          {
            method: "POST",
            body: JSON.stringify({
              razorpay_order_id: order.orderId,
              razorpay_payment_id: `sim_${Date.now()}`,
              razorpay_signature: "simulated",
            }),
          }
        );
        finish(data.reservation);
        return;
      }

      await loadRazorpay();
      if (!window.Razorpay) {
        throw new Error("Razorpay could not be loaded.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        name: "Aurelia",
        description: `${quote.hotel.name} · ${quote.nights} nights`,
        prefill: {
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          contact: guest.phone,
        },
        theme: { color: "#e8c547" },
        handler: async (response) => {
          try {
            const data = await api<{ reservation: Reservation }>(
              "/api/payments/verify",
              { method: "POST", body: JSON.stringify(response) }
            );
            finish(data.reservation);
          } catch (error) {
            setProcessing(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "The payment could not be verified."
            );
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      checkout.open();
    } catch (error) {
      setProcessing(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "The house could not take payment."
      );
    }
  }

  return (
    <div className="pt-24 pb-20">
      {processing ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/80 text-ivory backdrop-blur-sm">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
              Aurelia Secure Pay
            </p>
            <p className="mt-4 font-display text-4xl">Speaking with the house</p>
            <p className="mt-3 text-sm text-ivory/70">
              Authorising {formatINR(quote.total)}
            </p>
            <div className="mx-auto mt-8 h-px w-40 overflow-hidden bg-white/10">
              <div className="h-full w-full origin-left animate-pulse bg-gold" />
            </div>
          </div>
        </div>
      ) : null}

      <Container>
        <BookingSteps current={1} />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Guest folio</Eyebrow>
            <h1 className="mt-3 font-display text-5xl">Payment</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              The charge is taken now, securely through Razorpay. Cancellation
              remains available according to the house policy, with the refund
              shown before you confirm.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <select
                  id="title"
                  value={guest.title}
                  onChange={(event) => field("title", event.target.value)}
                  className="mt-2 h-12 w-full border border-input bg-card px-3 text-sm"
                >
                  {["Ms", "Mrs", "Mr", "Mx", "Dr"].map((title) => (
                    <option key={title}>{title}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="first">Given name</Label>
                <Input
                  id="first"
                  className="mt-2 h-12 rounded-none"
                  value={guest.firstName}
                  onChange={(event) => field("firstName", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="last">Family name</Label>
                <Input
                  id="last"
                  className="mt-2 h-12 rounded-none"
                  value={guest.lastName}
                  onChange={(event) => field("lastName", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-2 h-12 rounded-none"
                  value={guest.email}
                  onChange={(event) => field("email", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  id="phone"
                  className="mt-2 h-12 rounded-none"
                  value={guest.phone}
                  onChange={(event) => field("phone", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">A word for the house</Label>
                <Textarea
                  id="notes"
                  className="mt-2 min-h-24 rounded-none"
                  placeholder="Arrival time, florals, a particular chamber…"
                  value={guest.specialRequests}
                  onChange={(event) =>
                    field("specialRequests", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-3xl">How you will settle</h2>
              <div className="mt-5 flex items-start gap-3 border border-border bg-card p-5">
                <ShieldCheck className="mt-0.5 size-5 text-gold" />
                <div>
                  <p className="text-sm">
                    Card, UPI, net banking and wallets are handled by Razorpay.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You will complete the payment in a secure Razorpay window.
                    Aurelia never sees your card details.
                  </p>
                </div>
              </div>
            </div>

            <label className="mt-8 flex items-start gap-3 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(value) => setAgreed(value === true)}
                className="mt-0.5"
              />
              <span>
                I accept the{" "}
                <Link
                  href="/legal/terms"
                  className="text-gold underline underline-offset-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  terms of sale
                </Link>
                , the{" "}
                <Link
                  href="/legal/refunds"
                  className="text-gold underline underline-offset-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  refund policy
                </Link>
                , and the 18% tax levy.
              </span>
            </label>

            <Button
              onClick={pay}
              disabled={processing}
              className="mt-8 h-12 rounded-none bg-gold px-10 text-[11px] tracking-[0.24em] text-espresso uppercase hover:bg-gold-muted"
            >
              Pay {formatINR(quote.total)}
            </Button>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-border bg-card p-6">
              <div className="relative mb-5 aspect-[16/10]">
                <Image
                  src={quote.hotel.images[0]}
                  alt={quote.hotel.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
                {quote.hotel.location}
              </p>
              <h2 className="mt-1 font-display text-3xl">{quote.hotel.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {quote.room.name} · {formatDate(draft.checkIn, "dd MMM")} —{" "}
                {formatDate(draft.checkOut, "dd MMM yyyy")} · {quote.nights}{" "}
                nights
              </p>
              <div className="mt-6">
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
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
