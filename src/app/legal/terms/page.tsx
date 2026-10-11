import type { Metadata } from "next";
import Link from "next/link";
import {
  COPYRIGHT_CLAIM,
  STORE_EMAIL,
  STORE_NAME,
  copyrightLine,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of sale",
};

export default function TermsPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
        Terms of sale
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        These terms govern every stay bought on this website. By paying at
        checkout you accept them.
      </p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-white/70">
        <section>
          <h2 className="font-display text-2xl text-ivory">The seller</h2>
          <p className="mt-2">
            Stays are sold by {STORE_NAME}. Questions about an order go to{" "}
            <a href={`mailto:${STORE_EMAIL}`} className="text-gold">
              {STORE_EMAIL}
            </a>{" "}
            or the{" "}
            <Link href="/concierge" className="text-gold hover:underline">
              concierge desk
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">What you buy</h2>
          <p className="mt-2">
            You buy the right to occupy a named chamber for the nights shown on
            the quote, including any extras you add. The catalogue price is per
            night. The amount charged is the quote total: room, extras, and tax.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Price and tax</h2>
          <p className="mt-2">
            Prices are in Indian rupees. An 18% tax levy is calculated on the
            stay and shown before you pay. The button at checkout is the amount
            that will be charged. A chamber disappears from the catalogue for
            dates that are already reserved.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Payment</h2>
          <p className="mt-2">
            Payment is taken at checkout through Razorpay (card, UPI, net
            banking, or wallet). {STORE_NAME} does not store your card number
            or UPI PIN. The order is confirmed only when payment succeeds. If
            payment fails or you close the window, no stay is created.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Your details</h2>
          <p className="mt-2">
            The name, email, and telephone on the folio must be accurate. The
            confirmation and any sign-in link are sent to that email. You are
            responsible for arriving on the dates you bought.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">
            Cancellation and refunds
          </h2>
          <p className="mt-2">
            You may cancel from your folio. The refund is calculated from the{" "}
            <Link href="/legal/refunds" className="text-gold hover:underline">
              cancellation policy
            </Link>{" "}
            and shown before you confirm the cancellation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">The website</h2>
          <p className="mt-2">
            {copyrightLine()} {COPYRIGHT_CLAIM} You may not copy the interface
            or original text of this site. Residence photographs are not part
            of that claim and remain with their owners.
          </p>
        </section>
      </div>
    </>
  );
}
