"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
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
import type { GuestDetails, PaymentMethod, Quote, Reservation } from "@/lib/types";
import { cn } from "@/lib/utils";

const methods: Array<{
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}> = [
  { id: "card", label: "Card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, BHIM", icon: Smartphone },
  { id: "netbanking", label: "Net banking", hint: "Indian banks", icon: Landmark },
  { id: "wallet", label: "Wallet", hint: "Aurelia account credit", icon: Wallet },
];

const emptyGuest: GuestDetails = {
  title: "Ms",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "India",
  specialRequests: "",
};

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function CheckoutClient() {
  const router = useRouter();
  const { draft, setDraft, ready, refreshReservations } = useBookings();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [guest, setGuest] = useState<GuestDetails>(emptyGuest);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [bank, setBank] = useState("HDFC Bank");
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
    if (method === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (digits.length < 16 || !expiry || cvv.length < 3) {
        toast.error("The card is incomplete.");
        return;
      }
    }
    if (method === "upi" && !upi.includes("@")) {
      toast.error("Enter a UPI identity such as name@okhdfc.");
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      const data = await api<{ reservation: Reservation }>("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          hotelSlug: draft.hotelSlug,
          roomId: draft.roomId,
          checkIn: draft.checkIn,
          checkOut: draft.checkOut,
          extraIds: draft.extraIds,
          guests: draft.guests,
          guest,
          payment: {
            method,
            last4:
              method === "card"
                ? cardNumber.replace(/\s/g, "").slice(-4)
                : undefined,
            upiId: method === "upi" ? upi : undefined,
            brand: method === "card" ? "Visa" : undefined,
          },
        }),
      });
      setDraft(null);
      await refreshReservations();
      router.push(`/confirmation/${data.reservation.id}`);
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
              The charge is taken now. Cancellation remains available according
              to the house policy, with the refund shown before you confirm.
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
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {methods.map((item) => {
                  const Icon = item.icon;
                  const active = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={cn(
                        "flex items-start gap-3 border p-4 text-left",
                        active ? "border-espresso bg-card" : "border-border"
                      )}
                    >
                      <Icon className="mt-0.5 size-4 text-gold" />
                      <span>
                        <span className="block text-sm">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {method === "card" ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardName">Name on the card</Label>
                    <Input
                      id="cardName"
                      className="mt-2 h-12 rounded-none"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardNumber">Number</Label>
                    <Input
                      id="cardNumber"
                      inputMode="numeric"
                      placeholder="ACCT-000015"
                      className="mt-2 h-12 rounded-none tracking-[0.18em]"
                      value={cardNumber}
                      onChange={(event) =>
                        setCardNumber(formatCardNumber(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM / YY"
                      className="mt-2 h-12 rounded-none"
                      value={expiry}
                      onChange={(event) => setExpiry(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      inputMode="numeric"
                      className="mt-2 h-12 rounded-none"
                      value={cvv}
                      onChange={(event) =>
                        setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                    />
                  </div>
                </div>
              ) : null}

              {method === "upi" ? (
                <div className="mt-6">
                  <Label htmlFor="upi">UPI identity</Label>
                  <Input
                    id="upi"
                    placeholder="name@okhdfcbank"
                    className="mt-2 h-12 rounded-none"
                    value={upi}
                    onChange={(event) => setUpi(event.target.value)}
                  />
                </div>
              ) : null}

              {method === "netbanking" ? (
                <div className="mt-6">
                  <Label htmlFor="bank">Bank</Label>
                  <select
                    id="bank"
                    className="mt-2 h-12 w-full border border-input bg-card px-3 text-sm"
                    value={bank}
                    onChange={(event) => setBank(event.target.value)}
                  >
                    {[
                      "HDFC Bank",
                      "ICICI Bank",
                      "Axis Bank",
                      "State Bank of India",
                      "Kotak Mahindra",
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {method === "wallet" ? (
                <p className="mt-6 border border-border bg-card p-4 text-sm text-muted-foreground">
                  Circle members may settle against account credit. For this
                  preview, the wallet will authorise the full amount.
                </p>
              ) : null}
            </div>

            <label className="mt-8 flex items-start gap-3 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(value) => setAgreed(value === true)}
                className="mt-0.5"
              />
              <span>
                I accept the house cancellation policy, the 18% tax levy, and
                that this preview authorises a simulated payment only.
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
