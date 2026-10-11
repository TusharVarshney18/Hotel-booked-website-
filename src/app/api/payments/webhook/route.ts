import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fulfillPayment } from "@/lib/payments/fulfill";
import { mapRazorpayMethod, verifyWebhookSignature } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
        card?: { last4?: string; network?: string };
      };
    };
  };
};

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (entity?.order_id) {
    if (event.event === "payment.captured" || event.event === "order.paid") {
      await fulfillPayment({
        orderId: entity.order_id,
        paymentId: entity.id,
        method: mapRazorpayMethod(entity.method),
        last4: entity.card?.last4,
        brand: entity.card?.network,
      });
    } else if (event.event === "payment.failed") {
      await prisma.payment.updateMany({
        where: { orderId: entity.order_id, status: "created" },
        data: { status: "failed", paymentId: entity.id },
      });
    }
  }

  return NextResponse.json({ received: true });
}
