import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export const runtime = "nodejs";

function toCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/**
 * Manual metric entry for a published post (LinkedIn has no public
 * per-post analytics API for members, so the user copies the numbers).
 */
export async function PATCH(req: NextRequest) {
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

  let body: {
    postId?: string;
    impressions?: unknown;
    likes?: unknown;
    comments?: unknown;
    shares?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.postId) {
    return NextResponse.json({ error: "postId requis" }, { status: 400 });
  }

  const post = await prisma.scheduledPost.findFirst({
    where: { id: body.postId, userId: user.id, status: "published" },
  });
  if (!post) {
    return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
  }

  const updated = await prisma.scheduledPost.update({
    where: { id: post.id },
    data: {
      impressions: toCount(body.impressions),
      likes: toCount(body.likes),
      comments: toCount(body.comments),
      shares: toCount(body.shares),
      metricsAt: new Date(),
    },
    select: {
      id: true,
      impressions: true,
      likes: true,
      comments: true,
      shares: true,
      metricsAt: true,
    },
  });

  return NextResponse.json(updated);
}
