import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      plan: true,
      generationCount: true,
    },
  });

  if (!user) {
    return NextResponse.json({ plan: "free", generationCount: 0 });
  }

  return NextResponse.json(user);
}
