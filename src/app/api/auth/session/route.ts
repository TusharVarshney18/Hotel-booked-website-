import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
