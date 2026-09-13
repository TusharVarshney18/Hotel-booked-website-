import { NextRequest, NextResponse } from "next/server";
import { listHotels } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const hotels = await listHotels({
    destination: searchParams.get("destination") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    checkIn: searchParams.get("checkIn") ?? undefined,
    checkOut: searchParams.get("checkOut") ?? undefined,
    guests: searchParams.get("adults")
      ? Number(searchParams.get("adults")) +
        Number(searchParams.get("children") ?? 0)
      : undefined,
  });
  return NextResponse.json({ hotels });
}
