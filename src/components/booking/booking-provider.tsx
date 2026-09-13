"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import type { BookingDraft, Reservation } from "@/lib/types";

const DRAFT_KEY = "aurelia-draft";

export type Session = { email: string; role: "guest" | "admin" } | null;

type BookingContextValue = {
  ready: boolean;
  reservations: Reservation[];
  session: Session;
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft | null) => void;
  refreshReservations: () => Promise<void>;
  getReservation: (id: string) => Reservation | undefined;
  requestSignIn: (email: string) => Promise<{ previewUrl?: string }>;
  signOut: () => Promise<void>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [session, setSession] = useState<Session>(null);
  const [draft, setDraftState] = useState<BookingDraft | null>(null);

  const refreshReservations = useCallback(async () => {
    const data = await api<{ reservations: Reservation[] }>("/api/reservations");
    setReservations(data.reservations);
  }, []);

  const refreshSession = useCallback(async () => {
    const data = await api<{ session: Session }>("/api/auth/session");
    setSession(data.session);
  }, []);

  useEffect(() => {
    let stored: BookingDraft | null = null;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) stored = JSON.parse(raw) as BookingDraft;
    } catch {
      stored = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftState(stored);
    Promise.all([
      refreshSession().catch(() => setSession(null)),
      refreshReservations().catch(() => setReservations([])),
    ]).finally(() => setReady(true));
  }, [refreshReservations, refreshSession]);

  const setDraft = useCallback((next: BookingDraft | null) => {
    setDraftState(next);
    if (next) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const getReservation = useCallback(
    (id: string) => reservations.find((reservation) => reservation.id === id),
    [reservations]
  );

  const requestSignIn = useCallback(async (email: string) => {
    const data = await api<{ ok: boolean; previewUrl?: string }>(
      "/api/auth/magic-link",
      { method: "POST", body: JSON.stringify({ email }) }
    );
    return { previewUrl: data.previewUrl };
  }, []);

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setSession(null);
    await refreshReservations().catch(() => setReservations([]));
  }, [refreshReservations]);

  const value = useMemo(
    () => ({
      ready,
      reservations,
      session,
      draft,
      setDraft,
      refreshReservations,
      getReservation,
      requestSignIn,
      signOut,
    }),
    [
      ready,
      reservations,
      session,
      draft,
      setDraft,
      refreshReservations,
      getReservation,
      requestSignIn,
      signOut,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookings must be used within BookingProvider");
  }
  return context;
}
