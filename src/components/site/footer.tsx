import Link from "next/link";
import { Container } from "@/components/site/container";
import { COPYRIGHT_CLAIM, copyrightLine } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/collection", label: "All residences" },
      { href: "/destinations", label: "Destinations" },
      { href: "/experiences", label: "Experiences" },
      { href: "/circle", label: "Circle" },
    ],
  },
  {
    title: "Orders",
    links: [
      { href: "/reservations", label: "Your folio" },
      { href: "/checkout", label: "Checkout" },
      { href: "/concierge", label: "Concierge" },
      { href: "/about", label: "The house" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/legal", label: "How to buy" },
      { href: "/legal/terms", label: "Terms of sale" },
      { href: "/legal/refunds", label: "Refunds" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#05060a] text-ivory">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-20">
        <div>
          <p className="font-display text-4xl font-extrabold tracking-tight">
            AURELIA.
            <span className="block text-white/40">House</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
            A shop for private palaces, villas and residences. Choose a
            chamber, pay in rupees, and keep the folio.
          </p>
          <Link
            href="/concierge"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-gold px-5 text-[12px] font-semibold text-espresso"
          >
            Start a conversation
          </Link>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-[11px] tracking-[0.24em] text-gold uppercase">
              {column.title}
            </p>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyrightLine()}</p>
          <p>{COPYRIGHT_CLAIM}</p>
        </Container>
      </div>
    </footer>
  );
}
