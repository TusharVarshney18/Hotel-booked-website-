import type { Metadata } from "next";
import Link from "next/link";
import { STORE_EMAIL, STORE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
        Privacy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        What {STORE_NAME} keeps when you browse, buy, or write to the house.
      </p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-white/70">
        <section>
          <h2 className="font-display text-2xl text-ivory">Orders</h2>
          <p className="mt-2">
            A reservation stores the guest name, email, telephone, country,
            stay dates, chamber, extras, the amount paid, and the payment
            status. Card numbers and UPI PINs are handled by Razorpay and are
            not written into the house ledger.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Sign-in</h2>
          <p className="mt-2">
            There is no password. A sign-in link is emailed to you and expires
            in 15 minutes. A successful link sets an httpOnly cookie named
            aurelia-session for seven days so you can open the folios bought
            with that email. Signing out deletes the cookie.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Letters</h2>
          <p className="mt-2">
            The concierge form and the Circle enquiry store the name, email,
            and the message or membership tier you submit, so the desk can
            reply.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">What we do not do</h2>
          <p className="mt-2">
            We do not sell guest details. We do not use them to advertise other
            shops. Payment data stays with Razorpay under their own terms.
          </p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ivory">Asking for a copy</h2>
          <p className="mt-2">
            Write to{" "}
            <a href={`mailto:${STORE_EMAIL}`} className="text-gold">
              {STORE_EMAIL}
            </a>{" "}
            or the{" "}
            <Link href="/legal/contact" className="text-gold hover:underline">
              contact page
            </Link>{" "}
            to ask what is held against your email.
          </p>
        </section>
      </div>
    </>
  );
}
