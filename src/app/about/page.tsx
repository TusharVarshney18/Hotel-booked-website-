import Image from "next/image";
import { Container, Eyebrow } from "@/components/site/container";
import { unsplash } from "@/lib/images";

export const metadata = {
  title: "The house",
};

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20">
      <Container className="grid items-end gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Since 2014</Eyebrow>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">
            A house that collects houses.
          </h1>
        </div>
        <p className="text-muted-foreground">
          Aurelia began with a palace on a lake and a refusal to add a second
          wing. We restore, we staff, we decline the rest. Booking, payment and
          cancellation are designed to feel like correspondence — not a funnel.
        </p>
      </Container>
      <Container className="mt-14">
        <div className="relative aspect-[16/8] overflow-hidden">
          <Image
            src={unsplash("photo-1582719478250-c89cae4dc85b")}
            alt="Aurelia interior"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </Container>
      <Container className="mt-16 grid gap-10 md:grid-cols-3">
        {[
          {
            title: "No inventory theatre",
            body: "If a chamber is shown, it may be reserved. We do not manufacture urgency.",
          },
          {
            title: "Honourable cancellation",
            body: "The policy is printed before you pay, and again before you cancel. The refund is calculated in front of you.",
          },
          {
            title: "A quiet payment",
            body: "Card, UPI, net banking or wallet. The house never stores a number in this preview — the rail is simulated.",
          },
        ].map((item) => (
          <article key={item.title}>
            <h2 className="font-display text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.body}
            </p>
          </article>
        ))}
      </Container>
    </div>
  );
}
