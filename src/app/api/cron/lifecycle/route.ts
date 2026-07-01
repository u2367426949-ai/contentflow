import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import { getUserEmail } from "@/lib/auth";
import { sendActivationEmail, sendWeeklyInsightEmail } from "@/lib/email";
import type { PerformanceProfile } from "@/lib/performance";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Daily lifecycle-email sweep:
 * 1. Activation nudge for users who signed up 24-48h ago and never created a project.
 * 2. Weekly performance digest (Mondays only) for Pro/Agency users with a computed insight.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let activationsSent = 0;
  let digestsSent = 0;

  // ── 1. Activation nudge ──
  const windowStart = new Date(Date.now() - 2 * DAY_MS);
  const windowEnd = new Date(Date.now() - DAY_MS);
  const inactiveUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      activationEmailSentAt: null,
      projects: { none: {} },
    },
  });

  for (const user of inactiveUsers) {
    await prisma.user.update({ where: { id: user.id }, data: { activationEmailSentAt: new Date() } });
    const email = await getUserEmail(user.clerkId, user.email);
    if (email) {
      await sendActivationEmail(email);
      activationsSent++;
    }
  }

  // ── 2. Weekly performance digest (Mondays only) ──
  const isMonday = new Date().getUTCDay() === 1;
  if (isMonday) {
    const sixDaysAgo = new Date(Date.now() - 6 * DAY_MS);
    const candidates = await prisma.user.findMany({
      where: {
        OR: [{ lastDigestEmailAt: null }, { lastDigestEmailAt: { lt: sixDaysAgo } }],
      },
      include: { performanceInsights: true },
    });

    for (const user of candidates) {
      if (!getPlan(user.plan).analytics) continue;
      if (user.performanceInsights.length === 0) continue;

      const best = [...user.performanceInsights].sort((a, b) => b.postCount - a.postCount)[0];
      let summary = "";
      try {
        summary = (JSON.parse(best.insight) as Partial<PerformanceProfile>).summary || "";
      } catch {
        continue;
      }
      if (!summary) continue;

      await prisma.user.update({ where: { id: user.id }, data: { lastDigestEmailAt: new Date() } });
      const email = await getUserEmail(user.clerkId, user.email);
      if (email) {
        await sendWeeklyInsightEmail(email, best.platform, summary);
        digestsSent++;
      }
    }
  }

  return NextResponse.json({ activationsSent, digestsSent, isMonday });
}
