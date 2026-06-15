import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({
      linkedin: { connected: false },
      twitter: { connected: false },
    });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { userId: user.id, platform: { in: ["linkedin", "twitter"] } },
  });

  const linkedinAccount = accounts.find((a) => a.platform === "linkedin");
  const twitterAccount = accounts.find((a) => a.platform === "twitter");

  return NextResponse.json({
    linkedin: linkedinAccount
      ? { connected: true, name: linkedinAccount.externalName, expiresAt: linkedinAccount.expiresAt }
      : { connected: false },
    twitter: twitterAccount
      ? { connected: true, name: twitterAccount.externalName, expiresAt: twitterAccount.expiresAt }
      : { connected: false },
  });
}
