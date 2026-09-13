import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string, pattern = "dd MMM yyyy") {
  return format(parseISO(iso), pattern);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
  return Math.max(1, nights);
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function reservationCode() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `AUR-${n}`;
}
