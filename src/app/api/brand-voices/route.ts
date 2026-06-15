import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { analyzeVoice, SAMPLE_SEPARATOR } from "@/lib/brand-voice";

export const runtime = "nodejs";

export async function GET() {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json([]);

  const voices = await prisma.brandVoice.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(voices);
}

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user =
    (await prisma.user.findUnique({ where: { clerkId } })) ??
    (await prisma.user.create({ data: { clerkId } }));

  const plan = getPlan(user.plan);

  // Feature gate: brand voice cloning is a paid feature.
  if (plan.brandVoices === 0) {
    return NextResponse.json(
      {
        error:
          "Le clonage de voix est réservé aux plans payants. Passez à Creator pour cloner votre style.",
        upgradeUrl: "/upgrade",
      },
      { status: 402 }
    );
  }

  // Quota: number of stored voices per plan.
  const count = await prisma.brandVoice.count({ where: { userId: user.id } });
  if (count >= plan.brandVoices) {
    return NextResponse.json(
      {
        error: `Votre plan ${plan.name} permet ${plan.brandVoices} voix. Supprimez-en une ou passez à un plan supérieur.`,
        upgradeUrl: "/upgrade",
      },
      { status: 402 }
    );
  }

  let body: { name?: string; samples?: string[] | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // Accept either an array of posts or a single blob (split on blank lines).
  const rawSamples = Array.isArray(body.samples)
    ? body.samples
    : typeof body.samples === "string"
      ? body.samples.split(/\n\s*\n/)
      : [];

  const samples = rawSamples.map((s) => s.trim()).filter((s) => s.length > 20);

  if (samples.length < 2) {
    return NextResponse.json(
      {
        error:
          "Fournissez au moins 2 posts représentatifs (idéalement 3 à 5) pour cloner votre voix.",
      },
      { status: 400 }
    );
  }

  try {
    const profile = await analyzeVoice(samples);

    const voice = await prisma.brandVoice.create({
      data: {
        userId: user.id,
        name: (body.name || "Ma voix").slice(0, 80),
        samples: samples.join(SAMPLE_SEPARATOR),
        profile: JSON.stringify(profile),
        sampleCount: samples.length,
        status: "ready",
      },
    });

    return NextResponse.json(voice, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Brand voice analysis error:", message);
    return NextResponse.json(
      { error: `Erreur lors de l'analyse : ${message}` },
      { status: 500 }
    );
  }
}
