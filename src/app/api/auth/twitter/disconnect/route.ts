import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST() {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ ok: true });

  await prisma.socialAccount.deleteMany({ where: { userId: user.id, platform: "twitter" } });
  return NextResponse.json({ ok: true });
}
