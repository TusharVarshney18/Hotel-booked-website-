"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export function ConciergeForm({ reservationId }: { reservationId?: string }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await api("/api/concierge", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          folio: form.get("folio"),
          letter: form.get("letter"),
        }),
      });
      setSent(true);
      toast.success("The desk has your letter.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The desk could not take that."
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-gold/40 bg-card p-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
          Received
        </p>
        <h2 className="mt-3 font-display text-4xl">We have it</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Your letter is in the house book. A secretary will write back from the
          residence that holds your stay.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-border bg-card p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            className="mt-2 h-12 rounded-none"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 h-12 rounded-none"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="folio">Folio, if you have one</Label>
          <Input
            id="folio"
            name="folio"
            className="mt-2 h-12 rounded-none"
            defaultValue={reservationId}
            placeholder="AUR-000000"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="letter">The letter</Label>
          <Textarea
            id="letter"
            name="letter"
            required
            className="mt-2 min-h-40 rounded-none"
            defaultValue={
              reservationId
                ? `I should like to amend reservation ${reservationId}.`
                : ""
            }
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="mt-6 h-12 rounded-none bg-gold px-8 text-[11px] tracking-[0.22em] text-espresso uppercase hover:bg-gold-muted"
      >
        {pending ? "Sending" : "Send to the desk"}
      </Button>
    </form>
  );
}
