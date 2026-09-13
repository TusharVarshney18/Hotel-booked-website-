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

type BookingContextValue = {
  ready: boolean;
  reservations: Reservation[];
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft | null) => void;
  refreshReservations: (query?: { email?: string; folio?: string }) => Promise<void>;
  getReservation: (id: string) => Reservation | undefined;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [draft, setDraftState] = useState<BookingDraft | null>(null);

  const refreshReservations = useCallback(
    async (query?: { email?: string; folio?: string }) => {
      const params = new URLSearchParams();
      if (query?.email) params.set("email", query.email);
      if (query?.folio) params.set("folio", query.folio);
      const suffix = params.size ? `?${params.toString()}` : "";
      const data = await api<{ reservations: Reservation[] }>(
        `/api/reservations${suffix}`
      );
      setReservations(data.reservations);
    },
    []
  );

  useEffect(() => {
    try {
      const storedDraft = window.localStorage.getItem(DRAFT_KEY);
      if (storedDraft) {
        setDraftState(JSON.parse(storedDraft) as BookingDraft);
      }
    } catch {
      setDraftState(null);
    }
    refreshReservations()
      .catch(() => setReservations([]))
      .finally(() => setReady(true));
  }, [refreshReservations]);

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

  const value = useMemo(
    () => ({
      ready,
      reservations,
      draft,
      setDraft,
      refreshReservations,
      getReservation,
    }),
    [ready, reservations, draft, setDraft, refreshReservations, getReservation]
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
