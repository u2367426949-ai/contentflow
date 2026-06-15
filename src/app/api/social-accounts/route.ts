import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ linkedin: { connected: false } });

  const account = await prisma.socialAccount.findUnique({
    where: { userId_platform: { userId: user.id, platform: "linkedin" } },
  });

  if (!account) return NextResponse.json({ linkedin: { connected: false } });

  return NextResponse.json({
    linkedin: {
      connected: true,
      name: account.externalName,
      expiresAt: account.expiresAt,
    },
  });
}
