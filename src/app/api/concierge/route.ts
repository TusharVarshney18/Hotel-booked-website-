import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    folio?: string;
    letter?: string;
  };
  if (!body.name || !body.email || !body.letter) {
    return NextResponse.json({ error: "The letter is incomplete." }, { status: 400 });
  }
  const message = await prisma.conciergeMessage.create({
    data: {
      name: body.name,
      email: body.email,
      folio: body.folio || null,
      letter: body.letter,
    },
  });
  return NextResponse.json({ id: message.id });
}
