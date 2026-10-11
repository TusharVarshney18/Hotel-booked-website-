import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayKeyId,
} from "@/lib/payments/razorpay";
import { quoteStay } from "@/lib/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { firstIssue, paymentOrderSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, "payments-order", 10, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const parsed = paymentOrderSchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }

  const quote = await quoteStay({
    hotelSlug: parsed.data.hotelSlug,
    roomId: parsed.data.roomId,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    extraIds: parsed.data.extraIds,
  });
  if (!quote) {
    return NextResponse.json(
      { error: "That residence is no longer in the book." },
      { status: 404 }
    );
  }

  if (!isRazorpayConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Payment provider is not configured." },
        { status: 503 }
      );
    }
    const orderId = `sim_${crypto.randomUUID()}`;
    await prisma.payment.create({
      data: {
        orderId,
        amount: quote.total,
        currency: "INR",
        status: "created",
        payload: parsed.data as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({
      orderId,
      amount: quote.total,
      currency: "INR",
      keyId: "",
      simulated: true,
    });
  }

  const order = await createRazorpayOrder({
    amount: quote.total,
    receipt: `aurelia_${Date.now()}`,
    notes: { hotel: parsed.data.hotelSlug, room: parsed.data.roomId },
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: quote.total,
      currency: order.currency,
      status: "created",
      payload: parsed.data as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: quote.total,
    currency: order.currency,
    keyId: razorpayKeyId(),
    simulated: false,
  });
}
