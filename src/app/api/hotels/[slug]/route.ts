import { NextRequest, NextResponse } from "next/server";
import { getHotelBySlug } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(
    slug,
    request.nextUrl.searchParams.get("checkIn") ?? undefined,
    request.nextUrl.searchParams.get("checkOut") ?? undefined
  );
  if (!hotel) {
    return NextResponse.json({ error: "Residence not found." }, { status: 404 });
  }
  return NextResponse.json({ hotel });
}
