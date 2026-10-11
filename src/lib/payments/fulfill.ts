import type { z } from "zod";
import { prisma } from "@/lib/db";
import { createReservation, getReservationById } from "@/lib/queries";
import type { paymentOrderSchema } from "@/lib/schemas";
import type { PaymentMethod } from "@/lib/types";

export type PaymentOrderPayload = z.infer<typeof paymentOrderSchema>;

export async function fulfillPayment(input: {
  orderId: string;
  paymentId?: string;
  method?: PaymentMethod;
  last4?: string;
  brand?: string;
}) {
  const claim = await prisma.payment.updateMany({
    where: {
      orderId: input.orderId,
      status: { notIn: ["paid", "processing"] },
    },
    data: { status: "processing" },
  });

  if (claim.count === 0) {
    const order = await prisma.payment.findUnique({
      where: { orderId: input.orderId },
    });
    return order?.reservationId
      ? getReservationById(order.reservationId)
      : null;
  }

  const order = await prisma.payment.findUnique({
    where: { orderId: input.orderId },
  });
  if (!order) return null;

  const payload = order.payload as PaymentOrderPayload;
  const reservation = await createReservation({
    ...payload,
    payment: {
      method: input.method ?? "card",
      last4: input.last4,
      brand: input.brand,
    },
    paymentStatus: "paid",
  });

  await prisma.payment.update({
    where: { orderId: input.orderId },
    data: {
      status: "paid",
      paymentId: input.paymentId,
      method: input.method ?? "card",
      reservationId: reservation.id,
    },
  });

  return reservation;
}
