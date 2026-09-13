"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookings } from "@/components/booking/booking-provider";

export function LoginClient() {
  const { requestSignIn } = useBookings();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const result = await requestSignIn(email);
      setSent(true);
      setPreviewUrl(result.previewUrl ?? null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The link could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-8 border border-border bg-card p-6">
        <p className="text-sm">
          If a folio exists for {email}, a sign-in link is on its way. The link
          expires in 15 minutes.
        </p>
        {previewUrl ? (
          <a
            href={previewUrl}
            className="mt-3 inline-block break-all text-xs text-gold underline"
          >
            Development link: {previewUrl}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 h-12 rounded-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={sending}
        className="h-12 rounded-none bg-gold px-8 text-[11px] uppercase tracking-[0.24em] text-espresso hover:bg-gold-muted"
      >
        {sending ? "Sending" : "Email me a link"}
      </Button>
    </form>
  );
}
