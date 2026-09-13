import { CircleForm } from "@/components/site/circle-form";
import { Container, Eyebrow } from "@/components/site/container";
import { circleTiers } from "@/lib/content";

export const metadata = {
  title: "The Circle",
};

export default function CirclePage() {
  return (
    <div className="pt-24 pb-20">
      <Container className="max-w-3xl">
        <Eyebrow>Membership</Eyebrow>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">The Circle</h1>
        <p className="mt-4 text-muted-foreground">
          Not points. A secretary, a hold on a suite, and the right to be
          tedious about flowers. Membership is considered after a stay, or by
          letter.
        </p>
      </Container>
      <Container className="mt-14 grid gap-6 lg:grid-cols-3">
        {circleTiers.map((tier, index) => (
          <article
            key={tier.name}
            className={`flex flex-col border p-8 ${
              index === 1 ? "border-gold bg-card" : "border-border bg-card"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
              {tier.name}
            </p>
            <p className="mt-4 font-display text-3xl">{tier.price}</p>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
              {tier.perks.map((perk) => (
                <li key={perk} className="border-l border-gold/40 pl-4">
                  {perk}
                </li>
              ))}
            </ul>
            <CircleForm tier={tier.name} />
          </article>
        ))}
      </Container>
    </div>
  );
}
