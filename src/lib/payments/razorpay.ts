import crypto from "node:crypto";
import Razorpay from "razorpay";
import type { PaymentMethod } from "@/lib/types";

export type RazorpayOrderResult = {
  id: string;
  amount: number;
  currency: string;
};

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
}

export function razorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

function client() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured.");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(input: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderResult> {
  const order = await client().orders.create({
    amount: Math.round(input.amount * 100),
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

export async function fetchRazorpayPayment(paymentId: string) {
  const payment = await client().payments.fetch(paymentId);
  return payment as unknown as {
    method?: string;
    card?: { last4?: string; network?: string };
    bank?: string;
    wallet?: string;
  };
}

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

export function verifyPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
}

export function mapRazorpayMethod(method?: string): PaymentMethod {
  if (method === "upi") return "upi";
  if (method === "netbanking") return "netbanking";
  if (method === "wallet") return "wallet";
  return "card";
}
