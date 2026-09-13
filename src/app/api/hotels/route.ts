import { NextRequest, NextResponse } from "next/server";
import { listHotels } from "@/lib/queries";
import { firstIssue, hotelsQuerySchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = hotelsQuerySchema.safeParse({
    destination: params.get("destination"),
    collection: params.get("collection"),
    maxPrice: params.get("maxPrice"),
    checkIn: params.get("checkIn"),
    checkOut: params.get("checkOut"),
    adults: params.get("adults"),
    children: params.get("children"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }

  const { adults, children, ...filters } = parsed.data;
  const hotels = await listHotels({
    ...filters,
    guests: adults ? adults + (children ?? 0) : undefined,
  });
  return NextResponse.json({ hotels });
}
