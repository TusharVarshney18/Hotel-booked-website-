import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/site/container";
import { hotelsInCity, listDestinations } from "@/lib/queries";

export const metadata = {
  title: "Destinations",
};

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
  const destinations = await listDestinations();

  return (
    <div className="pt-24 pb-20">
      <Container className="max-w-3xl">
        <Eyebrow>On the map</Eyebrow>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Destinations</h1>
        <p className="mt-4 text-muted-foreground">
          We keep houses where the light is worth the journey — and nowhere we
          cannot staff to our standard.
        </p>
      </Container>
      <Container className="mt-14 grid gap-6 md:grid-cols-2">
        {await Promise.all(
          destinations.map(async (destination) => {
            const inCity = await hotelsInCity(destination.city);
            return (
              <article
                key={destination.city}
                className="overflow-hidden border border-border bg-card"
              >
                <Link
                  href={`/collection?destination=${encodeURIComponent(destination.city)}`}
                  className="img-zoom relative block aspect-[16/10]"
                >
                  <Image
                    src={destination.image}
                    alt={destination.city}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </Link>
                <div className="p-8">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                    {destination.country} · {destination.region}
                  </p>
                  <h2 className="mt-2 font-display text-4xl">{destination.city}</h2>
                  <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                    {inCity.map((hotel) => (
                      <li key={hotel.slug}>
                        <Link
                          href={`/collection/${hotel.slug}`}
                          className="hover:text-gold"
                        >
                          {hotel.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })
        )}
      </Container>
    </div>
  );
}
