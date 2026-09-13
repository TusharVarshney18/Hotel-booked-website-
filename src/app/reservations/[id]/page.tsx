import { ReservationDetailClient } from "@/components/booking/reservation-detail-client";

export const metadata = {
  title: "Reservation",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservationDetailClient id={id} />;
}
