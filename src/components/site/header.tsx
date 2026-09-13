"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useBookings } from "@/components/booking/booking-provider";

const nav = [
  { href: "/collection", label: "Work" },
  { href: "/destinations", label: "Map" },
  { href: "/experiences", label: "Rituals" },
  { href: "/circle", label: "Circle" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { reservations } = useBookings();
  const upcoming = reservations.filter((item) => item.status === "confirmed")
    .length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[#07080c]/80 text-ivory backdrop-blur-xl"
          : "bg-transparent text-ivory"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:h-[4.25rem] sm:px-8 lg:px-12">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="font-display text-lg font-extrabold tracking-tight sm:text-xl">
            AURELIA.
          </span>
          <span className="hidden text-[11px] tracking-[0.22em] text-white/45 uppercase sm:inline">
            House
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12px] font-medium tracking-wide text-white/65 transition-colors hover:text-white",
                pathname.startsWith(item.href) && "text-gold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Open for stays
          </span>
          <Link
            href="/reservations"
            className="text-[12px] text-white/65 hover:text-white"
          >
            Folio{upcoming ? ` · ${upcoming}` : ""}
          </Link>
          <Link
            href="/collection"
            className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-[12px] font-semibold text-espresso hover:bg-gold-muted"
          >
            Reserve
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-ivory hover:bg-white/10 lg:hidden"
              />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full border-l-white/10 bg-[#07080c] text-ivory sm:max-w-sm"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-2xl font-extrabold tracking-tight text-ivory">
                AURELIA. House
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-4 pt-6">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-4xl font-bold tracking-tight"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/reservations"
                onClick={() => setOpen(false)}
                className="text-white/60"
              >
                Folio
              </Link>
              <Link
                href="/concierge"
                onClick={() => setOpen(false)}
                className="text-white/60"
              >
                Concierge
              </Link>
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="text-white/60"
              >
                Studio notes
              </Link>
              <Link
                href="/collection"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-gold text-[12px] font-semibold text-espresso"
              >
                Reserve a stay
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
