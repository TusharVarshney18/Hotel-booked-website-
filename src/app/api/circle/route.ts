import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    tier?: string;
  };
  if (!body.name || !body.email || !body.tier) {
    return NextResponse.json({ error: "Please complete the enquiry." }, { status: 400 });
  }
  const enquiry = await prisma.circleEnquiry.create({
    data: {
      name: body.name,
      email: body.email,
      tier: body.tier,
    },
  });
  return NextResponse.json({ id: enquiry.id });
}
