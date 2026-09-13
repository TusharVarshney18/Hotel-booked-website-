import { NextRequest, NextResponse } from "next/server";
import { cancelReservationById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  try {
    const result = await cancelReservationById(
      id,
      body.reason || "Unspecified"
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The house could not release the chamber.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
