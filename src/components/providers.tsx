"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { BookingProvider } from "@/components/booking/booking-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <BookingProvider>
        {children}
        <Toaster theme="light" position="top-center" />
      </BookingProvider>
    </TooltipProvider>
  );
}
