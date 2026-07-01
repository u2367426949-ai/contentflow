import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { getOpenAI } from "@/lib/openai";
import { getUserId } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { buildVoiceInstruction } from "@/lib/brand-voice";
import { buildPerformanceInstruction } from "@/lib/performance";

export const runtime = "nodejs";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const TONE_MAP: Record<string, string> = {
  professionnel: "professionnel, expert et engageant",
  decontracte: "décontracté, amical et accessible",
  humoristique: "humoristique, drôle et léger",
  inspirant: "inspirant, motivant et positif",
  viral: "viral, accrocheur et percutant",
};

function getPrompt(platform: string, tone: string): string {
  const toneDesc = TONE_MAP[tone] || TONE_MAP.professionnel;
  switch (platform) {
    case "linkedin":
      return `Rédige un post LinkedIn d'environ 250-300 mots. Ton : ${toneDesc}. Inclus des emojis pertinents, des paragraphes courts, et termine par une question. Réponds UNIQUEMENT avec le post.`;
    case "twitter":
      return `Rédige un post Twitter/X de max 280 caractères. Ton : ${toneDesc}. Sois percutant, inclus 2-3 hashtags. Réponds UNIQUEMENT avec le post.`;
    case "instagram":
      return `Rédige une légende Instagram d'environ 150-200 caractères. Ton : ${toneDesc}. Ajoute 5-8 hashtags pertinents. Réponds UNIQUEMENT avec la légende.`;
    default:
      return "";
  }
}

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { projectId, tone, platforms: requestedPlatforms, brandVoiceId } = await req.json();
    if (!projectId) {
      return new Response(JSON.stringify({ error: "projectId requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // First try user-scoped lookup, then fallback to direct lookup
    let project = await prisma.contentProject.findFirst({
      where: { id: projectId, user: { clerkId } },
      include: { generations: true },
    });

    if (!project) {
      project = await prisma.contentProject.findFirst({
        where: { id: projectId },
        include: { generations: true },
      });
    }

    if (!project) {
      return new Response(JSON.stringify({ error: "Projet introuvable" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!project.sourceText) {
      return new Response(
        JSON.stringify({
          error:
            "Le projet n'a pas de contenu source. Vérifiez l'URL fournie.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sourceText = project.sourceText;

    // ─── Quota check ───
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({ data: { clerkId } });
    }

    const currentMonth = getCurrentMonth();
    const plan = getPlan(user.plan);

    if (plan.genQuota !== null) {
      // Reset count if month changed
      if (user.generationMonth !== currentMonth) {
        await prisma.user.update({
          where: { id: user.id },
          data: { generationCount: 0, generationMonth: currentMonth },
        });
        user.generationCount = 0;
      }

      if (user.generationCount >= plan.genQuota) {
        return new Response(
          JSON.stringify({
            error: "QUOTA_EXCEEDED",
            message: `Vous avez atteint la limite de ${plan.genQuota} générations ce mois-ci.`,
            upgradeUrl: "/upgrade",
          }),
          {
            status: 402,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
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
    const performanceByPlatform: Record<string, string> = {};
    if (plan.analytics) {
      const insights = await prisma.performanceInsight.findMany({
        where: { userId: user.id },
      });
      for (const i of insights) {
        performanceByPlatform[i.platform] = buildPerformanceInstruction(i.insight, i.platform);
      }
    }

    const openai = getOpenAI();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Keep-alive heartbeat every 5s to prevent Vercel Hobby timeout
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 5000);

        try {
          const platforms = requestedPlatforms || ["linkedin", "twitter", "instagram"];

          for (const platform of platforms) {

            // Send section start event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "section", platform })}\n\n`
              )
            );

            const genStream = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `Tu es un expert en marketing de contenu. ${getPrompt(platform, tone || "professionnel")}${voiceInstruction ? `\n\n${voiceInstruction}` : ""}${performanceByPlatform[platform] ? `\n\n${performanceByPlatform[platform]}` : ""}`,
                },
                {
                  role: "user",
                  content: `Article à adapter pour ${platform} :\n\n${sourceText.slice(0, 6000)}`,
                },
              ],
              temperature: 0.7,
              max_tokens: platform === "linkedin" ? 600 : platform === "twitter" ? 150 : 400,
              stream: true,
            });

            let fullContent = "";
            for await (const chunk of genStream) {
              const delta = chunk.choices[0]?.delta?.content || "";
              if (delta) {
                fullContent += delta;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "chunk", platform, content: delta })}\n\n`
                  )
                );
              }
            }

            // Save to DB immediately
            const genRecord = await prisma.generation.findFirst({
              where: {
                projectId: project.id,
                platform,
              },
            });
            if (genRecord && fullContent.trim()) {
              await prisma.generation.update({
                where: { id: genRecord.id },
                data: {
                  content: fullContent.trim(),
                  status: "completed",
                  brandVoiceId: resolvedVoiceId,
                },
              });
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done", platform })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", projectId: project.id })}\n\n`
            )
          );

          // Increment generation count for quota-limited plans
          if (plan.genQuota !== null) {
            await prisma.user.update({
              where: { id: user!.id },
              data: { generationCount: { increment: 1 } },
            });
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Erreur de génération";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
        } finally {
          clearInterval(heartbeatInterval);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur de génération";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
