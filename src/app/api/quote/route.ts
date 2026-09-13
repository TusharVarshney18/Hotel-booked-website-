import { NextRequest, NextResponse } from "next/server";
import { quoteStay } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    hotelSlug?: string;
    roomId?: string;
    checkIn?: string;
    checkOut?: string;
    extraIds?: string[];
  };
  if (!body.hotelSlug || !body.roomId || !body.checkIn || !body.checkOut) {
    return NextResponse.json({ error: "Incomplete stay details." }, { status: 400 });
  }
  const quote = await quoteStay({
    hotelSlug: body.hotelSlug,
    roomId: body.roomId,
    checkIn: body.checkIn,
    checkOut: body.checkOut,
    extraIds: body.extraIds ?? [],
  });
  if (!quote) {
    return NextResponse.json({ error: "That residence is no longer in the book." }, { status: 404 });
  }
  return NextResponse.json({ quote });
}
