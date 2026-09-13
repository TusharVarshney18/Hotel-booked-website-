import { CancelClient } from "@/components/booking/cancel-client";

export const metadata = {
  title: "Cancel reservation",
};

export default async function CancelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CancelClient id={id} />;
}
