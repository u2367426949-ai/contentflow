import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  // First try user-scoped lookup, then fallback to direct lookup
  let project = await prisma.contentProject.findFirst({
    where: { id, user: { clerkId } },
    include: {
      generations: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!project) {
    project = await prisma.contentProject.findFirst({
      where: { id },
      include: {
        generations: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  if (!project) {
    return NextResponse.json(
      { error: "Projet introuvable" },
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.contentProject.findFirst({
    where: {
      id,
      user: { clerkId },
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Projet introuvable" },
      { status: 404 }
    );
  }

  await prisma.contentProject.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
