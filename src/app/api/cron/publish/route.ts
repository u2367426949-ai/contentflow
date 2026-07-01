import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { decrypt, encrypt } from "@/lib/crypto";
import { publishToLinkedIn } from "@/lib/linkedin";
import { publishToTwitter, refreshTwitterToken } from "@/lib/twitter";
import { getUserEmail } from "@/lib/auth";
import { sendPublishFailureEmail } from "@/lib/email";

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
  const failuresByUser = new Map<
    string,
    { clerkId: string; email: string | null; failures: { platform: string; error: string }[] }
  >();

  function recordFailure(post: (typeof due)[number], error: string) {
    const entry = failuresByUser.get(post.userId) || {
      clerkId: post.user.clerkId,
      email: post.user.email,
      failures: [],
    };
    entry.failures.push({ platform: post.platform, error });
    failuresByUser.set(post.userId, entry);
  }

  for (const post of due) {
    const account = post.user.socialAccounts.find((a) => a.platform === post.platform);

    if (!getPlan(post.user.plan).autoPublish) {
      const error = "Publication automatique non disponible sur votre plan";
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error },
      });
      recordFailure(post, error);
      failed++;
      continue;
    }

    if (!account) {
      const error = "Compte non connecté ou session expirée";
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error },
      });
      recordFailure(post, error);
      failed++;
      continue;
    }

    try {
      let externalId = "";
      if (post.platform === "linkedin") {
        if (account.expiresAt && account.expiresAt < new Date()) {
          throw new Error("LinkedIn non connecté ou session expirée");
        }
        const accessToken = decrypt(account.accessTokenEnc);
        const result = await publishToLinkedIn(accessToken, account.externalId, post.content);
        externalId = result.id;
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

        const result = await publishToTwitter(accessToken, post.content);
        externalId = result.id;
      }

      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: "published",
          publishedAt: new Date(),
          error: null,
          externalId: externalId || null,
        },
      });
      published++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const error = message.slice(0, 500);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: "failed", error },
      });
      recordFailure(post, error);
      failed++;
    }
  }

  // ── One summary email per user with failures (not one per post) ──
  for (const { clerkId, email: cachedEmail, failures } of failuresByUser.values()) {
    const email = await getUserEmail(clerkId, cachedEmail);
    if (email) await sendPublishFailureEmail(email, failures);
  }

  return NextResponse.json({ processed: due.length, published, failed });
}
