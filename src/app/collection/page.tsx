import { CollectionExplorer } from "@/components/hotels/collection-explorer";
import { Container, Eyebrow } from "@/components/site/container";
import { listDestinations, listHotels } from "@/lib/queries";

type Search = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
};

export const metadata = {
  title: "The collection",
};

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const [hotels, destinations] = await Promise.all([
    listHotels({
      destination: params.destination,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: params.adults
        ? Number(params.adults) + Number(params.children ?? 0)
        : undefined,
    }),
    listDestinations(),
  ]);

  return (
    <div className="pt-24 pb-20">
      <Container className="mb-12 max-w-3xl">
        <Eyebrow>The live ledger</Eyebrow>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl">
          Selected
          <span className="block text-white/40">houses.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Palaces, villas, a ryokan, a chalet. Availability is read from the
          house book — chambers already held for those dates will not appear.
        </p>
      </Container>
      <CollectionExplorer
        initialHotels={hotels}
        destinations={destinations}
        initialDestination={params.destination}
        checkIn={params.checkIn}
        checkOut={params.checkOut}
        adults={params.adults}
        children={params.children}
      />
    </div>
  );
}
