import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import type { Hotel } from "@/lib/types";

export function HotelCard({
  hotel,
  featured = false,
  index,
}: {
  hotel: Hotel;
  featured?: boolean;
  index?: number;
}) {
  const number = index !== undefined ? String(index + 1).padStart(2, "0") : null;

  return (
    <Link
      href={`/collection/${hotel.slug}`}
      className={
        featured
          ? "group grid overflow-hidden rounded-3xl border border-white/10 bg-card lg:grid-cols-2"
          : "group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-card"
      }
    >
      <div
        className={
          featured
            ? "img-zoom relative min-h-[280px] lg:min-h-[440px]"
            : "img-zoom relative aspect-[4/5]"
        }
      >
        <Image
          src={hotel.images[0]}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {number ? (
            <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-gold backdrop-blur">
              {number} — Featured
            </span>
          ) : null}
          <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/80 backdrop-blur">
            {hotel.collection}
          </span>
        </div>
      </div>
      <div className={featured ? "flex flex-col justify-end p-8 lg:p-12" : "flex flex-1 flex-col p-6"}>
        <p className="text-[11px] tracking-[0.22em] text-white/45 uppercase">
          {hotel.location}
        </p>
        <h3 className="mt-2 font-display text-3xl leading-[1.05] font-bold tracking-tight lg:text-4xl">
          {hotel.name}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
          {hotel.tagline}
        </p>
        <div className="mt-6 flex items-end justify-between gap-4">
          <p className="text-sm">
            From {formatINR(hotel.priceFrom)}
            <span className="text-white/40"> / night</span>
          </p>
          <span className="text-[12px] font-medium text-gold">Open live →</span>
        </div>
      </div>
    </Link>
  );
}
