import { NextResponse } from "next/server";
import { listDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const destinations = await listDestinations();
  return NextResponse.json({ destinations });
}
