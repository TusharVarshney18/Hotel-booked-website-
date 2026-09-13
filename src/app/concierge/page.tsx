import { ConciergeForm } from "@/components/site/concierge-form";
import { Container, Eyebrow } from "@/components/site/container";

export const metadata = {
  title: "Concierge",
};

export default async function ConciergePage({
  searchParams,
}: {
  searchParams: Promise<{ reservation?: string }>;
}) {
  const { reservation } = await searchParams;
  return (
    <div className="pt-24 pb-20">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Always awake</Eyebrow>
          <h1 className="mt-3 font-display text-5xl">Concierge</h1>
          <p className="mt-4 text-muted-foreground">
            Amendments, flowers, a closed museum, a second chamber for a child.
            Write as you would to a secretary. We answer from the house that
            holds your stay.
          </p>
          <dl className="mt-10 space-y-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Desk
              </dt>
              <dd className="mt-1">+91 22 4000 1814</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Letter
              </dt>
              <dd className="mt-1">concierge@aurelia.example</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Hours
              </dt>
              <dd className="mt-1">Every hour, in the house’s timezone</dd>
            </div>
          </dl>
        </div>
        <ConciergeForm reservationId={reservation} />
      </Container>
    </div>
  );
}
