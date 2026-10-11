import type { Metadata } from "next";
import Link from "next/link";
import { COPYRIGHT_CLAIM, STORE_NAME, copyrightLine } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop policies",
  description: `How to buy a stay from ${STORE_NAME}. ${COPYRIGHT_CLAIM}`,
};

const steps = [
  {
    title: "Choose a residence",
    body: "The collection is the catalogue. Every price is in Indian rupees, per chamber, per night. Dates that are already sold do not appear.",
  },
  {
    title: "Hold the stay",
    body: "Select the chamber, the nights, and any extras. The quote shows the room total, extras, and 18% tax before you pay.",
  },
  {
    title: "Pay",
    body: "Checkout takes payment through Razorpay — card, UPI, net banking, or wallet. The reservation is confirmed only after payment succeeds. Aurelia never stores your card number.",
  },
  {
    title: "Keep the order",
    body: "The confirmation is your folio. Sign in with the same email to view, or cancel, the stay. Refunds follow the printed cancellation policy.",
  },
];

export default function LegalIndexPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
        Buying a stay
      </h1>
      <p className="mt-4 text-muted-foreground">
        {STORE_NAME} sells private residences the way a shop sells goods: a
        catalogue, a price, a checkout, and an order you can open later.
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t border-white/10 pt-6">
            <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
              0{index + 1}
            </p>
            <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <ul className="mt-10 space-y-2 text-sm">
        <li>
          <Link href="/legal/terms" className="text-gold hover:underline">
            Terms of sale
          </Link>
        </li>
        <li>
          <Link href="/legal/refunds" className="text-gold hover:underline">
            Refunds and cancellation
          </Link>
        </li>
        <li>
          <Link href="/legal/privacy" className="text-gold hover:underline">
            Privacy
          </Link>
        </li>
        <li>
          <Link href="/legal/contact" className="text-gold hover:underline">
            Merchant contact
          </Link>
        </li>
        <li>
          <Link href="/collection" className="text-gold hover:underline">
            Open the shop
          </Link>
        </li>
      </ul>
      <p className="mt-12 text-sm text-white/70">{copyrightLine()}</p>
      <p className="mt-1 text-sm text-white/70">{COPYRIGHT_CLAIM}</p>
      <p className="mt-3 text-xs leading-relaxed text-white/40">
        The copyright covers the design, interface, and original text of this
        website. Photographs of residences remain with their respective owners.
      </p>
    </>
  );
}
