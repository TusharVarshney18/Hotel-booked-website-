import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow } from "@/components/site/container";
import { HotelBookingPanel } from "@/components/hotels/hotel-booking-panel";
import { getHotelBySlug } from "@/lib/queries";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  return {
    title: hotel?.name ?? "Residence",
    description: hotel?.description,
  };
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  return (
    <div className="bg-background pt-16">
      <div className="grid gap-1 bg-espresso md:grid-cols-4 md:grid-rows-2">
        <div className="relative min-h-[320px] md:col-span-2 md:row-span-2 md:min-h-[72vh]">
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
        {hotel.images.slice(1, 5).map((image) => (
          <div key={image} className="relative hidden min-h-[220px] md:block">
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="25vw"
            />
          </div>
        ))}
      </div>

      <Container className="grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div>
          <Eyebrow>{hotel.collection}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl">
            {hotel.name}
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-muted-foreground">
            {hotel.location}
          </p>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed">
            {hotel.description}
          </p>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {hotel.longDescription}
          </p>

          <div className="mt-12">
            <Eyebrow>The house keeps</Eyebrow>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {hotel.amenities.map((item) => (
                <li
                  key={item}
                  className="border-l border-gold/50 pl-4 text-sm text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <Eyebrow>Chambers</Eyebrow>
            <div className="mt-6 space-y-6">
              {hotel.rooms.map((room) => (
                <article
                  key={room.id}
                  className="grid overflow-hidden border border-border bg-card md:grid-cols-[0.9fr_1.1fr]"
                >
                  <div className="relative min-h-[220px]">
                    <Image
                      src={room.images[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 768px) 30vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-3xl">{room.name}</h3>
                      <p className="text-sm">
                        {formatINR(room.price)}
                        <span className="text-muted-foreground"> / night</span>
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {room.description}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {room.size} · {room.beds} · sleeps {room.occupancy}
                    </p>
                    <Link
                      href={`/reserve?hotel=${hotel.slug}&room=${room.id}`}
                      className="mt-6 inline-flex h-11 w-fit items-center rounded-full bg-gold px-5 text-[12px] font-semibold text-espresso"
                    >
                      Hold this chamber
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <Eyebrow>Arranged here</Eyebrow>
            <ul className="mt-6 space-y-3">
              {hotel.experiences.map((item) => (
                <li key={item} className="font-display text-2xl">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14">
            <Eyebrow>From the book</Eyebrow>
            <div className="mt-6 space-y-6">
              {hotel.reviews.map((review) => (
                <blockquote key={review.name} className="border-t border-border pt-6">
                  <p className="font-display text-2xl">“{review.body}”</p>
                  <footer className="mt-4 text-sm text-muted-foreground">
                    {review.name}, {review.origin} · {review.date}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>

        <HotelBookingPanel hotel={hotel} />
      </Container>
    </div>
  );
}
