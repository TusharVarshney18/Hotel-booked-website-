import { NextRequest, NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { firstIssue, magicLinkSchema } from "@/lib/schemas";
import { signMagicLink } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const limited = await checkRateLimit(request, "magic-link", 5, 60);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const parsed = magicLinkSchema.safeParse(
    await request.json().catch(() => ({}))
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const token = await signMagicLink(email);
  const origin = process.env.APP_URL ?? request.nextUrl.origin;
  const url = `${origin}/api/auth/callback?token=${encodeURIComponent(token)}`;
  const result = await sendMagicLink(email, url);

  return NextResponse.json({
    ok: true,
    ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
  });
}
