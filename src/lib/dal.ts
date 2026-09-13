import { cookies } from "next/headers";
import { readFolioIds } from "@/lib/folio";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function isAdmin() {
  const session = await getSession();
  return session?.role === "admin";
}

export async function canAccessReservation(reservation: {
  id: string;
  email: string;
}) {
  const session = await getSession();
  if (session?.role === "admin") return true;
  if (
    session &&
    session.email.toLowerCase() === reservation.email.toLowerCase()
  ) {
    return true;
  }
  const ids = await readFolioIds();
  return ids.includes(reservation.id);
}
