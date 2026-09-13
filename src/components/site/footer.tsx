import Link from "next/link";
import { Container } from "@/components/site/container";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/collection", label: "All residences" },
      { href: "/destinations", label: "Map" },
      { href: "/experiences", label: "Rituals" },
      { href: "/circle", label: "Circle" },
    ],
  },
  {
    title: "Stay",
    links: [
      { href: "/reservations", label: "Your folio" },
      { href: "/concierge", label: "Concierge" },
      { href: "/about", label: "The house" },
      { href: "/collection", label: "Reserve" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#05060a] text-ivory">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:py-20">
        <div>
          <p className="font-display text-4xl font-extrabold tracking-tight">
            AURELIA.
            <span className="block text-white/40">House</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
            Private palaces, villas and residences — designed, booked and
            cancelled like a shipped product. Ledger live. Payment quiet.
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
        <Container className="flex flex-col gap-3 py-6 text-[11px] tracking-[0.18em] text-white/35 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aurelia House · Delhi craft, global stays</p>
          <p>Prisma ledger · simulated rails</p>
        </Container>
      </div>
    </footer>
  );
}
