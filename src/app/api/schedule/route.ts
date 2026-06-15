import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json([]);

  const posts = await prisma.scheduledPost.findMany({
    where: { userId: user.id, scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user =
    (await prisma.user.findUnique({ where: { clerkId } })) ??
    (await prisma.user.create({ data: { clerkId } }));

  // Scheduling is available on all paid plans
  if (!getPlan(user.plan).autoPublish) {
    return NextResponse.json(
      { error: "Planification réservée aux plans payants", upgradeUrl: "/upgrade" },
      { status: 402 }
    );
  }

  const { projectId, platform, content, tone, scheduledAt } = await req.json();

  if (!platform || !content || !scheduledAt) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const post = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      projectId: projectId || null,
      platform,
      content,
      tone: tone || "professionnel",
      scheduledAt: new Date(scheduledAt),
    },
    include: { project: { select: { title: true } } },
  });

  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const { id } = await req.json();
  const post = await prisma.scheduledPost.findFirst({ where: { id, userId: user.id } });
  if (post) {
    await prisma.scheduledPost.delete({ where: { id: post.id } });
  }

  return NextResponse.json({ ok: true });
}
