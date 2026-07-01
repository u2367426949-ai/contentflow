import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { decrypt, encrypt } from "@/lib/crypto";
import { fetchTweetMetrics, refreshTwitterToken } from "@/lib/twitter";
import { analyzePerformance, MIN_MEASURED_POSTS } from "@/lib/performance";

export const runtime = "nodejs";

/**
 * Refresh the performance loop:
 * 1. Auto-fetch X metrics for published tweets (scope tweet.read).
 * 2. Recompute the AI insight for every platform with enough measured posts.
 */
export async function POST() {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const plan = getPlan(user.plan);
  if (!plan.analytics) {
    return NextResponse.json(
      {
        error: "La boucle de performance est réservée aux plans Pro et Agency.",
        upgradeUrl: "/upgrade",
      },
      { status: 402 }
    );
  }

  let twitterFetched = 0;
  let twitterError: string | null = null;

  // ── 1. Auto-fetch X metrics ──
  try {
    const account = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: "twitter" } },
    });

    if (account) {
      const tweets = await prisma.scheduledPost.findMany({
        where: {
          userId: user.id,
          platform: "twitter",
          status: "published",
          externalId: { not: null },
        },
        orderBy: { publishedAt: "desc" },
        take: 100,
        select: { id: true, externalId: true },
      });

      if (tweets.length > 0) {
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

        const metrics = await fetchTweetMetrics(
          accessToken,
          tweets.map((t) => t.externalId as string)
        );

        for (const tweet of tweets) {
          const m = metrics[tweet.externalId as string];
          if (!m) continue;
          await prisma.scheduledPost.update({
            where: { id: tweet.id },
            data: {
              impressions: m.impressions,
              likes: m.likes,
              comments: m.comments,
              shares: m.shares,
              metricsAt: new Date(),
            },
          });
          twitterFetched++;
        }
      }
    }
  } catch (err) {
    // X metrics are best-effort (API tier limits) — keep going with manual data.
    twitterError = err instanceof Error ? err.message : String(err);
  }

  // ── 2. Recompute insights per platform ──
  const measured = await prisma.scheduledPost.findMany({
    where: {
      userId: user.id,
      status: "published",
      metricsAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
    select: {
      platform: true,
      content: true,
      publishedAt: true,
      impressions: true,
      likes: true,
      comments: true,
      shares: true,
    },
  });

  const byPlatform = new Map<string, typeof measured>();
  for (const post of measured) {
    const list = byPlatform.get(post.platform) || [];
    list.push(post);
    byPlatform.set(post.platform, list);
  }

  const updatedPlatforms: string[] = [];
  for (const [platform, posts] of byPlatform) {
    if (posts.length < MIN_MEASURED_POSTS) continue;

    const profile = await analyzePerformance(platform, posts);
    const data = {
      insight: JSON.stringify(profile),
      postCount: posts.length,
    };

    // No .upsert(): Neon HTTP adapter rejects the implicit transaction.
    const existing = await prisma.performanceInsight.findUnique({
      where: { userId_platform: { userId: user.id, platform } },
    });
    if (existing) {
      await prisma.performanceInsight.update({ where: { id: existing.id }, data });
    } else {
      await prisma.performanceInsight.create({
        data: { userId: user.id, platform, ...data },
      });
    }
    updatedPlatforms.push(platform);
  }

  const insights = await prisma.performanceInsight.findMany({
    where: { userId: user.id },
  });

  return NextResponse.json({
    twitterFetched,
    twitterError,
    updatedPlatforms,
    minMeasuredPosts: MIN_MEASURED_POSTS,
    insights,
  });
}
