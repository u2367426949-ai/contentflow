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
  });

  if (!user) {
    return NextResponse.json({ exists: false, clerkId, message: "Utilisateur inexistant en DB — c'est le bug !" });
  }

  return NextResponse.json({
    exists: true,
    id: user.id,
    plan: user.plan,
    generationCount: user.generationCount,
    generationMonth: user.generationMonth,
    stripeCustomerId: user.stripeCustomerId,
  });
}
