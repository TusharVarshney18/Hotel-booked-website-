import { NextRequest, NextResponse } from "next/server";
import { quoteStay } from "@/lib/queries";
import { firstIssue, quoteSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const parsed = quoteSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: firstIssue(parsed.error) },
      { status: 400 }
    );
  }
  const quote = await quoteStay(parsed.data);
  if (!quote) {
    return NextResponse.json(
      { error: "That residence is no longer in the book." },
      { status: 404 }
    );
  }
  return NextResponse.json({ quote });
}
