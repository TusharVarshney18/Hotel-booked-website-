import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { addFolioId, readFolioIds } from "@/lib/folio";
import { createReservation, listReservations } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { createReservationSchema, firstIssue } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const [session, ids] = await Promise.all([getSession(), readFolioIds()]);
  const reservations = await listReservations(ids, session?.email);
  return NextResponse.json({ reservations });
}

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, "reservations", 10, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const parsed = createReservationSchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const reservation = await createReservation(parsed.data);
    await addFolioId(reservation.id);
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The house could not take payment.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
