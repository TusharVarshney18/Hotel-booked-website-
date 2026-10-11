import type { Metadata } from "next";
import Link from "next/link";
import { CANCELLATION_TIERS } from "@/lib/policies";
import { STORE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refunds",
};

export default function RefundsPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
        Refunds
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {STORE_NAME} does not sell physical goods, so there is no shipping
        return. A stay can be cancelled from your folio. The refund depends on
        how many days remain before check-in, counted from the day you cancel.
      </p>
      <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {CANCELLATION_TIERS.map((tier) => (
          <li key={tier.label} className="grid gap-2 py-5 sm:grid-cols-[12rem_1fr]">
            <p className="font-display text-xl text-gold">{tier.label}</p>
            <div>
              <p className="text-sm text-white/80">{tier.detail}</p>
              <p className="mt-1 text-xs tracking-[0.16em] text-white/40 uppercase">
                {tier.percent}% of the room total
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 space-y-3 text-sm leading-relaxed text-white/70">
        <p>
          Taxes are refunded in full. Unused extras are refunded in full. The
          exact rupee amount is shown on the cancellation screen before you
          confirm. Refunds are returned through the same Razorpay payment you
          used to buy the stay.
        </p>
        <p>
          A stay that has already begun is not cancelled through this page.
          Write to the{" "}
          <Link href="/concierge" className="text-gold hover:underline">
            concierge
          </Link>{" "}
          if you need the house after arrival.
        </p>
      </div>
    </>
  );
}
