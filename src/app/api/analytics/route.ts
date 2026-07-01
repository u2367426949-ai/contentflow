import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * Performance dashboard data: published posts (with metrics) + AI insights.
 * Gated by the plan's `analytics` flag (Pro / Agency).
 */
export async function GET() {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ posts: [], insights: [], plan: "free" });
  }

  const plan = getPlan(user.plan);
  if (!plan.analytics) {
    return NextResponse.json(
      {
        error:
          "La boucle de performance est réservée aux plans Pro et Agency.",
        upgradeUrl: "/upgrade",
      },
      { status: 402 }
    );
  }

  const [posts, insights, twitterAccount] = await Promise.all([
    prisma.scheduledPost.findMany({
      where: { userId: user.id, status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true,
        platform: true,
        content: true,
        publishedAt: true,
        externalId: true,
        impressions: true,
        likes: true,
        comments: true,
        shares: true,
        metricsAt: true,
      },
    }),
    prisma.performanceInsight.findMany({ where: { userId: user.id } }),
    prisma.socialAccount.findFirst({
      where: { userId: user.id, platform: "twitter" },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({
    posts,
    insights,
    plan: plan.id,
    twitterConnected: Boolean(twitterAccount),
  });
}
