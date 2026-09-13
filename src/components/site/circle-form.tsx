"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export function CircleForm({ tier }: { tier: string }) {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await api("/api/circle", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          tier,
        }),
      });
      setSent(true);
      toast.success("The Circle has your name.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The Circle could not take that."
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Received. We write only when a place is truly open.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-3">
      <div>
        <Label htmlFor={`${tier}-name`} className="sr-only">
          Name
        </Label>
        <Input
          id={`${tier}-name`}
          name="name"
          required
          placeholder="Name"
          className="h-11 rounded-none"
        />
      </div>
      <div>
        <Label htmlFor={`${tier}-email`} className="sr-only">
          Email
        </Label>
        <Input
          id={`${tier}-email`}
          name="email"
          type="email"
          required
          placeholder="Email"
          className="h-11 rounded-none"
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-none bg-espresso text-[11px] tracking-[0.22em] text-ivory uppercase"
      >
        {pending ? "Sending" : "Request this tier"}
      </Button>
    </form>
  );
}
