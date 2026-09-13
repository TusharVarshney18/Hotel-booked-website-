import { NextRequest, NextResponse } from "next/server";
import { canAccessReservation } from "@/lib/dal";
import { cancelReservationById, getReservationById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };

  const current = await getReservationById(id);
  if (
    !current ||
    !(await canAccessReservation({
      id: current.id,
      email: current.guest.email,
    }))
  ) {
    return NextResponse.json({ error: "Folio not found." }, { status: 404 });
  }

  const reason =
    typeof body.reason === "string" && body.reason.trim()
      ? body.reason.trim().slice(0, 500)
      : "Unspecified";

  try {
    const result = await cancelReservationById(id, reason);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The house could not release the chamber.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
