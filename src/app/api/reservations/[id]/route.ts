import { NextResponse } from "next/server";
import { getReservationById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reservation = await getReservationById(id);
  if (!reservation) {
    return NextResponse.json({ error: "Folio not found." }, { status: 404 });
  }
  return NextResponse.json({ reservation });
}
