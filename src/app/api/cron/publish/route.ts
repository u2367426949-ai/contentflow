import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { decrypt, encrypt } from "@/lib/crypto";
import { publishToLinkedIn } from "@/lib/linkedin";
import { publishToTwitter, refreshTwitterToken } from "@/lib/twitter";

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
      platform: { in: ["linkedin", "twitter"] },
      scheduledAt: { lte: new Date() },
    },
    include: {
      user: {
        include: {
          socialAccounts: { where: { platform: { in: ["linkedin", "twitter"] } } },
        },
      },
    },
  });

  let published = 0;
  let failed = 0;

  for (const post of due) {
    const account = post.user.socialAccounts.find((a) => a.platform === post.platform);

    if (!getPlan(post.user.plan).autoPublish) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: "Publication automatique non disponible sur votre plan" },
      });
      failed++;
      continue;
    }

    if (!account) {
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error: "Compte non connecté ou session expirée" },
      });
      failed++;
      continue;
    }

    try {
      if (post.platform === "linkedin") {
        if (account.expiresAt && account.expiresAt < new Date()) {
          throw new Error("LinkedIn non connecté ou session expirée");
        }
        const accessToken = decrypt(account.accessTokenEnc);
        await publishToLinkedIn(accessToken, account.externalId, post.content);
      } else if (post.platform === "twitter") {
        let accessToken = decrypt(account.accessTokenEnc);

        if (account.expiresAt && account.expiresAt < new Date()) {
          if (!account.refreshTokenEnc) {
            throw new Error("X non connecté ou session expirée");
          }
          const refreshed = await refreshTwitterToken(decrypt(account.refreshTokenEnc));
          accessToken = refreshed.accessToken;
          await prisma.socialAccount.update({
            where: { id: account.id },
            data: {
              accessTokenEnc: encrypt(refreshed.accessToken),
              refreshTokenEnc: encrypt(refreshed.refreshToken),
              expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
            },
          });
        }

        await publishToTwitter(accessToken, post.content);
      }

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
