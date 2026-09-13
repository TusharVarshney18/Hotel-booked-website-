import { ConfirmationClient } from "@/components/booking/confirmation-client";

export const metadata = {
  title: "Reservation confirmed",
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ConfirmationClient id={id} />;
}
