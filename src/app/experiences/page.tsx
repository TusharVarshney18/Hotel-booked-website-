import Image from "next/image";
import { Container, Eyebrow } from "@/components/site/container";
import { listExperiences } from "@/lib/queries";

export const metadata = {
  title: "Experiences",
};

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const experiences = await listExperiences();

  return (
    <div className="pt-24 pb-20">
      <Container className="max-w-3xl">
        <Eyebrow>Arranged, not listed</Eyebrow>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Experiences</h1>
        <p className="mt-4 text-muted-foreground">
          What we arrange is often not printed. A closed museum. A still lagoon.
          A table that does not exist until you sit down.
        </p>
      </Container>
      <Container className="mt-14 space-y-8">
        {experiences.map((item, index) => (
          <article
            key={item.slug}
            className="grid overflow-hidden border border-border bg-card lg:grid-cols-2"
          >
            <div
              className={`img-zoom relative min-h-[280px] lg:min-h-[420px] ${
                index % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-14">
              <Eyebrow>{item.kicker}</Eyebrow>
              <h2 className="mt-4 font-display text-4xl">{item.title}</h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                {item.description}
              </p>
              <p className="mt-8 text-sm">
                Requested with a reservation, or written to concierge.
              </p>
            </div>
          </article>
        ))}
      </Container>
    </div>
  );
}
