import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const voice = await prisma.brandVoice.findFirst({
    where: { id, user: { clerkId } },
  });

  if (!voice) {
    return NextResponse.json({ error: "Voix introuvable" }, { status: 404 });
  }

  return NextResponse.json(voice);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const voice = await prisma.brandVoice.findFirst({
    where: { id, user: { clerkId } },
  });

  if (!voice) {
    return NextResponse.json({ error: "Voix introuvable" }, { status: 404 });
  }

  await prisma.brandVoice.delete({ where: { id: voice.id } });

  return NextResponse.json({ ok: true });
}
