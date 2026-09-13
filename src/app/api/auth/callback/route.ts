import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyMagicLinkToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const email = await verifyMagicLinkToken(token);

  if (!email) {
    return NextResponse.redirect(
      new URL("/reservations?auth=invalid", request.nextUrl)
    );
  }

  await createSession({ email, role: "guest" });
  return NextResponse.redirect(new URL("/reservations", request.nextUrl));
}
