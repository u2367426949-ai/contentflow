import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { decrypt } from "@/lib/crypto";
import { publishToLinkedIn } from "@/lib/linkedin";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const due = await prisma.scheduledPost.findMany({
    where: {
      status: "pending",
      platform: "linkedin",
      scheduledAt: { lte: new Date() },
    },
    include: {
      user: {
        include: {
          socialAccounts: { where: { platform: "linkedin" } },
        },
      },
    },
  });

  let published = 0;
  let failed = 0;

  for (const post of due) {
    const account = post.user.socialAccounts[0];

    if (!getPlan(post.user.plan).autoPublish) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: "Publication automatique non disponible sur votre plan" },
      });
      failed++;
      continue;
    }

    if (!account || (account.expiresAt && account.expiresAt < new Date())) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: "LinkedIn non connecté ou session expirée" },
      });
      failed++;
      continue;
    }

    try {
      const accessToken = decrypt(account.accessTokenEnc);
      await publishToLinkedIn(accessToken, account.externalId, post.content);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "published", publishedAt: new Date(), error: null },
      });
      published++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: message.slice(0, 500) },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: due.length, published, failed });
}
