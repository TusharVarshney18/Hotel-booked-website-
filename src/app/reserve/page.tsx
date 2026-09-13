import { Suspense } from "react";
import { ReserveClient } from "@/components/booking/reserve-client";

export const metadata = {
  title: "Reserve",
};

export default function ReservePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center pt-24">
          <p className="text-sm tracking-[0.22em] uppercase text-muted-foreground">
            Preparing the house ledger
          </p>
        </div>
      }
    >
      <ReserveClient />
    </Suspense>
  );
}
