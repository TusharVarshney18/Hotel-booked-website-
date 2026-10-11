import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { readFolioIds } from "@/lib/folio";
import { listReservations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const [session, ids] = await Promise.all([getSession(), readFolioIds()]);
  const reservations = await listReservations(ids, session?.email);
  return NextResponse.json({ reservations });
}
