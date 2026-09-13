import { differenceInCalendarDays, parseISO } from "date-fns";

export type RefundTier = {
  label: string;
  detail: string;
  percent: number;
};

export const CANCELLATION_TIERS: RefundTier[] = [
  {
    label: "14 days or more",
    detail: "Full refund of the stay, taxes and unused extras.",
    percent: 100,
  },
  {
    label: "7 to 13 days",
    detail: "70% of the stay is returned. Taxes are refunded in full.",
    percent: 70,
  },
  {
    label: "3 to 6 days",
    detail: "40% of the stay is returned. Taxes are refunded in full.",
    percent: 40,
  },
  {
    label: "Under 3 days",
    detail: "The stay is non-refundable. Taxes and unused extras are returned.",
    percent: 0,
  },
];

export function refundPercentForCheckIn(checkIn: string, from = new Date()) {
  const days = differenceInCalendarDays(parseISO(checkIn), from);
  if (days >= 14) return 100;
  if (days >= 7) return 70;
  if (days >= 3) return 40;
  return 0;
}

export function calculateRefund(input: {
  checkIn: string;
  roomTotal: number;
  extrasTotal: number;
  taxes: number;
  from?: Date;
}) {
  const percent = refundPercentForCheckIn(input.checkIn, input.from);
  const stayRefund = Math.round((input.roomTotal * percent) / 100);
  const extrasRefund = input.extrasTotal;
  const taxRefund = input.taxes;
  const amount = stayRefund + extrasRefund + taxRefund;
  const total = input.roomTotal + input.extrasTotal + input.taxes;
  return {
    percent,
    stayRefund,
    extrasRefund,
    taxRefund,
    amount: Math.min(amount, total),
    daysUntil: differenceInCalendarDays(
      parseISO(input.checkIn),
      input.from ?? new Date()
    ),
  };
}
