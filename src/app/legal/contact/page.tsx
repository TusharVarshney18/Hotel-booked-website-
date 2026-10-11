import type { Metadata } from "next";
import Link from "next/link";
import {
  COPYRIGHT_CLAIM,
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_NAME,
  STORE_PHONE,
  copyrightLine,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">
        Contact
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        The merchant behind the checkout, and the person who made the website.
      </p>
      <dl className="mt-10 space-y-6 text-sm">
        <div>
          <dt className="text-[11px] tracking-[0.22em] text-gold uppercase">
            Store
          </dt>
          <dd className="mt-1 text-white/80">{STORE_NAME}</dd>
          <dd className="text-white/55">{STORE_ADDRESS}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.22em] text-gold uppercase">
            Orders and stays
          </dt>
          <dd className="mt-1">
            <a href={`tel:${STORE_PHONE.replace(/\s/g, "")}`} className="text-white/80">
              {STORE_PHONE}
            </a>
          </dd>
          <dd>
            <a href={`mailto:${STORE_EMAIL}`} className="text-gold">
              {STORE_EMAIL}
            </a>
          </dd>
          <dd className="mt-2">
            <Link href="/concierge" className="text-gold hover:underline">
              Write to the concierge
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.22em] text-gold uppercase">
            Website
          </dt>
          <dd className="mt-1 text-white/80">{copyrightLine()}</dd>
          <dd className="text-white/80">{COPYRIGHT_CLAIM}</dd>
        </div>
      </dl>
    </>
  );
}
