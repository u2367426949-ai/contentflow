import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { buildVoiceInstruction } from "@/lib/brand-voice";
import { buildPerformanceInstruction } from "@/lib/performance";
import { applyWatermark } from "@/lib/watermark";

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { projectId, tone, brandVoiceId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

    // ── Quota check ──
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-06"
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({ data: { clerkId } });
    }

    // Reset quota if new month
    if (user.generationMonth !== currentMonth) {
      user = await prisma.user.update({
        where: { clerkId },
        data: { generationCount: 0, generationMonth: currentMonth },
      });
    }

    const plan = getPlan(user.plan);
    if (plan.genQuota !== null && user.generationCount >= plan.genQuota) {
      return NextResponse.json(
        {
          error: "Quota gratuit dépassé",
          quota: { plan: user.plan, used: user.generationCount, limit: plan.genQuota },
          upgradeUrl: "/upgrade",
        },
        { status: 402 }
      );
    }

    // First try user-scoped lookup, then fallback to direct lookup
    let project = await prisma.contentProject.findFirst({
      where: { id: projectId, user: { clerkId } },
      include: { generations: true },
    });
    
    if (!project) {
      // Fallback: project might have been created before Clerk was configured
      project = await prisma.contentProject.findFirst({
        where: { id: projectId },
        include: { generations: true },
      });
    }

    if (!project) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    if (!project.sourceText) {
      return NextResponse.json(
        { error: "Le projet n'a pas de contenu source. Vérifiez l'URL fournie." },
        { status: 400 }
      );
    }

    // ── Brand voice (optional, owned by this user) ──
    let voiceInstruction = "";
    let resolvedVoiceId: string | null = null;
    if (brandVoiceId) {
      const voice = await prisma.brandVoice.findFirst({
        where: { id: brandVoiceId, userId: user.id },
      });
      if (voice) {
        voiceInstruction = buildVoiceInstruction(voice.profile);
        resolvedVoiceId = voice.id;
      }
    }

    // ── Performance loop (Pro/Agency): lean into what already performs ──
    let performanceInstruction = "";
    if (plan.analytics) {
      const insights = await prisma.performanceInsight.findMany({
        where: { userId: user.id },
      });
      performanceInstruction = insights
        .map((i) => buildPerformanceInstruction(i.insight, i.platform))
        .filter(Boolean)
        .join("\n\n");
    }

    const openai = getOpenAI();
    const sourceText = project.sourceText;

    // SINGLE optimized call: generate all 3 posts + key points in one go
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en marketing de contenu. À partir d'un article, tu génères :
1. Un résumé des points clés (3-5 phrases)
2. Un post LinkedIn professionnel (~250-300 mots)
3. Un post Twitter/X (max 280 caractères)
4. Une légende Instagram (~150-200 mots avec hashtags)
${voiceInstruction ? `\n${voiceInstruction}\n` : ""}${performanceInstruction ? `\n${performanceInstruction}\n` : ""}
Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après :
{
  "keyPoints": ["point 1", "point 2", ...],
  "linkedin": "contenu du post linkedin...",
  "twitter": "contenu du post twitter...",
  "instagram": "contenu du post instagram..."
}`,
        },
        {
          role: "user",
          content: `Génère les posts pour cet article :\n\n${sourceText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, string | string[]> = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Erreur de parsing de la réponse IA" }, { status: 500 });
    }

    const keyPoints = Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [];
    const posts: Record<string, string> = {
      linkedin: typeof parsed.linkedin === "string" ? parsed.linkedin : "",
      twitter: typeof parsed.twitter === "string" ? parsed.twitter : "",
      instagram: typeof parsed.instagram === "string" ? parsed.instagram : "",
    };

    if (plan.id === "free") {
      for (const platform of Object.keys(posts)) {
        if (posts[platform]) posts[platform] = applyWatermark(platform, posts[platform]);
      }
    }

    // Save to DB with individual updates
    const results: { platform: string; content: string }[] = [];
    for (const [platform, content] of Object.entries(posts)) {
      const gen = project.generations.find((g) => g.platform === platform);
      if (gen && content) {
        await prisma.generation.update({
          where: { id: gen.id },
          data: { content, status: "completed", brandVoiceId: resolvedVoiceId },
        });
        results.push({ platform, content });
      }
    }

    // Fetch updated generations
    const updatedGenerations = await prisma.generation.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    // ── Increment quota for quota-limited plans ──
    if (plan.genQuota !== null) {
      await prisma.user.update({
        where: { clerkId },
        data: { generationCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      projectId: project.id,
      generations: updatedGenerations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Generate error:", message);
    return NextResponse.json({ error: `Erreur: ${message}` }, { status: 500 });
  }
}
