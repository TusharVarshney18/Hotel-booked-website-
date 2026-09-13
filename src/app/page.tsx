import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/site/container";
import { SearchBar } from "@/components/booking/search-bar";
import { HotelCard } from "@/components/hotels/hotel-card";
import { Marquee } from "@/components/site/marquee";
import { pillars } from "@/lib/content";
import {
  getHotelBySlug,
  listDestinations,
  listExperiences,
  listFeaturedHotels,
  listTestimonials,
} from "@/lib/queries";
import { unsplash } from "@/lib/images";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, destinations, experiences, testimonials, quietest] =
    await Promise.all([
      listFeaturedHotels(),
      listDestinations(),
      listExperiences(),
      listTestimonials(),
      getHotelBySlug("kiyomizu"),
    ]);

  const stats = [
    { value: "10", label: "Residences" },
    { value: String(destinations.length), label: "Cities" },
    { value: "4.97", label: "House rating" },
    { value: "24h", label: "Concierge" },
  ];

  return (
    <>
      <section className="studio-grid relative overflow-hidden bg-[#07080c] pt-24 text-ivory">
        <Container className="grid items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <p className="rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-gold">
                New
              </span>
              Live ledger · availability in real time
            </p>
            <h1 className="rise rise-delay-1 mt-6 font-display text-[3.1rem] leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-[5.2rem]">
              Arrive like
              <span className="block text-gold">the future</span>
              is watching.
            </h1>
            <p className="rise rise-delay-2 mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
              Palaces, villas and residences — interfaces, APIs and a house
              book that actually holds the chamber. Premium stays, shipped
              end to end.
            </p>
            <div className="rise rise-delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href="/collection"
                className="inline-flex h-12 items-center rounded-full bg-gold px-6 text-[13px] font-semibold text-espresso"
              >
                Explore work
              </Link>
              <Link
                href="/concierge"
                className="inline-flex h-12 items-center rounded-full border border-white/15 px-6 text-[13px] font-medium text-white/80"
              >
                Start a conversation
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] tracking-[0.18em] text-white/40 uppercase">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-bold tracking-tight">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="img-zoom relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 glow-gold">
              <Image
                src={unsplash("photo-1542314831-068cd1dbfeeb")}
                alt="Aurelia residence at dusk"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            </div>
            <div className="absolute top-6 right-4 w-44 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] tracking-[0.2em] text-white/45 uppercase">
                Tonight
              </p>
              <p className="mt-1 font-display text-lg font-bold">Udaipur</p>
              <p className="text-xs text-gold">Lake Palace · 4.98</p>
            </div>
            <div className="absolute bottom-6 left-4 w-52 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
              <p className="text-[10px] tracking-[0.2em] text-white/45 uppercase">
                From
              </p>
              <p className="mt-1 font-display text-2xl font-bold">₹1,25,000</p>
              <p className="text-xs text-white/50">chamber / night</p>
            </div>
          </div>
        </Container>

        <Container className="pb-10">
          <SearchBar destinations={destinations} />
        </Container>
        <Marquee items={destinations.map((item) => item.city)} />
      </section>

      <section className="py-20 lg:py-28">
        <Container className="grid items-end gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Eyebrow>01 — The platform</Eyebrow>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl">
              Everything a private house
              <span className="block text-white/40"> would give you.</span>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-white/55">
            Aurelia is not a chain. It is a collection we would stay in
            ourselves — restored palaces, cliff villas, a ryokan of nine rooms.
            Booking, payment and cancellation run on a live ledger.
          </p>
        </Container>
        <Container className="mt-14 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.number}
              className="rounded-3xl border border-white/10 bg-card p-8"
            >
              <p className="font-display text-4xl font-bold text-gold">
                {pillar.number}
              </p>
              <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                {pillar.body}
              </p>
            </article>
          ))}
        </Container>
      </section>

      <section className="pb-20 lg:pb-28">
        <Container className="mb-10 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>02 — Featured</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Selected
              <span className="block text-white/40">residences.</span>
            </h2>
          </div>
          <Link
            href="/collection"
            className="hidden text-[13px] font-medium text-gold sm:inline"
          >
            View all houses →
          </Link>
        </Container>
        <Container className="grid gap-6">
          {featured.slice(0, 2).map((hotel, index) => (
            <HotelCard key={hotel.slug} hotel={hotel} featured index={index} />
          ))}
          <div className="grid gap-6 md:grid-cols-2">
            {featured.slice(2).map((hotel, index) => (
              <HotelCard key={hotel.slug} hotel={hotel} index={index + 2} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-white/10 bg-black/30 py-20 lg:py-28">
        <Container>
          <Eyebrow>03 — Map</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Destinations.
          </h2>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {destinations.map((destination) => (
              <Link
                key={destination.city}
                href={`/collection?destination=${encodeURIComponent(destination.city)}`}
                className="group relative min-h-[260px] overflow-hidden rounded-3xl"
              >
                <Image
                  src={destination.image}
                  alt={destination.city}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 20vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] tracking-[0.22em] text-gold uppercase">
                    {destination.country}
                  </p>
                  <p className="font-display text-2xl font-bold">{destination.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container className="mb-12">
          <Eyebrow>04 — Rituals</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Arranged,
            <span className="block text-white/40">not listed.</span>
          </h2>
        </Container>
        <Container className="grid gap-4 md:grid-cols-2">
          {experiences.map((item) => (
            <Link
              key={item.slug}
              href="/experiences"
              className="group grid overflow-hidden rounded-3xl border border-white/10 bg-card sm:grid-cols-[0.9fr_1.1fr]"
            >
              <div className="img-zoom relative min-h-[220px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 25vw, 100vw"
                />
              </div>
              <div className="flex flex-col justify-center p-8">
                <Eyebrow>{item.kicker}</Eyebrow>
                <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </Container>
      </section>

      {quietest ? (
        <section className="relative overflow-hidden py-28 text-ivory">
          <Image
            src={quietest.images[0]}
            alt={quietest.name}
            fill
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <Container className="relative max-w-3xl text-center">
            <Eyebrow className="text-gold">Flagship</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              {quietest.name}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/70">
              {quietest.description}
            </p>
            <p className="mt-6 text-sm text-gold">
              From {formatINR(quietest.priceFrom)} / night
            </p>
            <Link
              href={`/collection/${quietest.slug}`}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-gold px-8 text-[13px] font-semibold text-espresso"
            >
              Open live project
            </Link>
          </Container>
        </section>
      ) : null}

      <section className="py-20 lg:py-28">
        <Container>
          <Eyebrow>05 — Notes</Eyebrow>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            Loved by people
            <span className="block text-white/40">who actually stay.</span>
          </h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className="flex flex-col rounded-3xl border border-white/10 bg-card p-8"
              >
                <p className="text-lg leading-snug text-white/80">
                  “{item.quote}”
                </p>
                <footer className="mt-8 text-sm text-white/45">
                  <p className="font-medium text-white">{item.name}</p>
                  <p>{item.detail}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-white/10 py-20">
        <Container className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent px-8 py-14 text-center lg:px-16">
          <Eyebrow>Circle</Eyebrow>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Your next stay
            <span className="block">starts right now.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/55">
            Membership is a secretary, a hold on a suite, and the right to be
            tedious about flowers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/circle"
              className="inline-flex h-12 items-center rounded-full bg-gold px-7 text-[13px] font-semibold text-espresso"
            >
              Join the Circle
            </Link>
            <Link
              href="/collection"
              className="inline-flex h-12 items-center rounded-full border border-white/15 px-7 text-[13px] text-white/80"
            >
              See the collection
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
