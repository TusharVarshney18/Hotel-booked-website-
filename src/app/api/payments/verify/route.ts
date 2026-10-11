import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addFolioId } from "@/lib/folio";
import { fulfillPayment } from "@/lib/payments/fulfill";
import {
  fetchRazorpayPayment,
  isRazorpayConfigured,
  mapRazorpayMethod,
  verifyPaymentSignature,
} from "@/lib/payments/razorpay";
import { getReservationById } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { firstIssue, paymentVerifySchema } from "@/lib/schemas";
import type { PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, "payments-verify", 20, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const parsed = paymentVerifySchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const order = await prisma.payment.findUnique({ where: { orderId } });
  if (!order) {
    return NextResponse.json({ error: "Folio not found." }, { status: 404 });
  }

  if (order.status === "paid" && order.reservationId) {
    const existing = await getReservationById(order.reservationId);
    if (existing) {
      await addFolioId(existing.id);
      return NextResponse.json({ reservation: existing });
    }
  }

  const simulated =
    orderId.startsWith("sim_") && process.env.NODE_ENV !== "production";
  if (!simulated && !verifyPaymentSignature({ orderId, paymentId, signature })) {
    return NextResponse.json(
      { error: "The payment could not be verified." },
      { status: 400 }
    );
  }

  let method: PaymentMethod = "card";
  let last4: string | undefined;
  let brand: string | undefined;

  if (!simulated && isRazorpayConfigured()) {
    try {
      const payment = await fetchRazorpayPayment(paymentId);
      method = mapRazorpayMethod(payment.method);
      last4 = payment.card?.last4;
      brand = payment.card?.network;
    } catch {
      method = "card";
    }
  }

  const reservation = await fulfillPayment({
    orderId,
    paymentId,
    method,
    last4,
    brand,
  });
  if (!reservation) {
    return NextResponse.json(
      { error: "That folio could not be written." },
      { status: 409 }
    );
  }

  await addFolioId(reservation.id);
  return NextResponse.json({ reservation }, { status: 201 });
}
