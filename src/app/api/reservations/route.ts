import { NextRequest, NextResponse } from "next/server";
import { addFolioId, readFolioIds, writeFolioIds } from "@/lib/folio";
import { createReservation, listReservations } from "@/lib/queries";
import type { GuestDetails, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email") ?? undefined;
  const folio = request.nextUrl.searchParams.get("folio") ?? undefined;
  const ids = await readFolioIds();
  if (folio && !ids.includes(folio)) ids.push(folio);
  const reservations = await listReservations(ids, email);
  if (reservations.length) {
    await writeFolioIds([...ids, ...reservations.map((item) => item.id)]);
  }
  return NextResponse.json({ reservations });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    hotelSlug?: string;
    roomId?: string;
    checkIn?: string;
    checkOut?: string;
    extraIds?: string[];
    guests?: { adults: number; children: number };
    guest?: GuestDetails;
    payment?: {
      method: PaymentMethod;
      last4?: string;
      upiId?: string;
      brand?: string;
    };
  };

  if (
    !body.hotelSlug ||
    !body.roomId ||
    !body.checkIn ||
    !body.checkOut ||
    !body.guests ||
    !body.guest ||
    !body.payment
  ) {
    return NextResponse.json({ error: "The folio is incomplete." }, { status: 400 });
  }

  if (
    !body.guest.firstName ||
    !body.guest.lastName ||
    !body.guest.email ||
    !body.guest.phone
  ) {
    return NextResponse.json({ error: "Please complete the guest folio." }, { status: 400 });
  }

  try {
    const reservation = await createReservation({
      hotelSlug: body.hotelSlug,
      roomId: body.roomId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      extraIds: body.extraIds ?? [],
      guests: body.guests,
      guest: body.guest,
      payment: body.payment,
    });
    await addFolioId(reservation.id);
    return NextResponse.json({ reservation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The house could not take payment.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
