import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import openai from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return new Response(JSON.stringify({ error: "projectId requis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const project = await prisma.contentProject.findFirst({
      where: {
        id: projectId,
        user: { clerkId },
      },
      include: { generations: true },
    });

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

    // Reset generations
    await prisma.generation.updateMany({
      where: { projectId: project.id },
      data: { status: "pending", content: null },
    });

    const sourceText = project.sourceText;

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Extract key points
          const keyPointsStream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Tu es un assistant qui extrait les points clés d'un article. Réponds UNIQUEMENT avec un objet JSON contenant un tableau 'keyPoints' de 3 à 5 chaînes de caractères.",
              },
              {
                role: "user",
                content: `Extrais les points clés de cet article :\n\n${sourceText}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            stream: true,
          });

          let keyPointsRaw = "";
          for await (const chunk of keyPointsStream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              keyPointsRaw += delta;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "chunk", platform: "keypoints", content: delta })}\n\n`
                )
              );
            }
          }

          let keyPoints: string[] = [];
          try {
            const parsed = JSON.parse(keyPointsRaw);
            keyPoints = parsed.keyPoints || [];
          } catch {
            keyPoints = [];
          }

          const keyPointsText =
            keyPoints.length > 0
              ? keyPoints.map((kp: string, i: number) => `${i + 1}. ${kp}`).join("\n")
              : "Points clés non disponibles.";

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", platform: "keypoints" })}\n\n`
            )
          );

          // Step 2: Generate posts for each platform
          const platformConfigs = [
            {
              platform: "linkedin",
              tone: "professionnel",
              instructions:
                "Rédige un post LinkedIn professionnel d'environ 250-300 mots. Utilise un ton expert et engageant. Inclus des emojis pertinents, des paragraphes courts, et termine par une question pour encourager l'engagement.",
            },
            {
              platform: "twitter",
              tone: "concis",
              instructions:
                "Rédige un post Twitter/X d'au maximum 280 caractères. Sois percutant et donne envie de cliquer. Inclus 2-3 hashtags pertinents.",
            },
            {
              platform: "instagram",
              tone: "engageant",
              instructions:
                "Rédige une légende Instagram d'environ 150-200 caractères, engageante et inspirante. Ajoute 5 à 8 hashtags pertinents à la fin.",
            },
          ];

          for (const plat of platformConfigs) {
            const genStream = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `Tu es un expert en marketing de contenu. Génère un post ${plat.platform} optimisé. ${plat.instructions}`,
                },
                {
                  role: "user",
                  content: `Voici les points clés de l'article :\n${keyPointsText}\n\nEt l'article complet :\n${sourceText}`,
                },
              ],
              temperature: 0.7,
              stream: true,
            });

            let fullContent = "";
            for await (const chunk of genStream) {
              const delta = chunk.choices[0]?.delta?.content || "";
              if (delta) {
                fullContent += delta;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "chunk", platform: plat.platform, content: delta })}\n\n`
                  )
                );
              }
            }

            // Save to DB
            await prisma.generation.updateMany({
              where: {
                projectId: project.id,
                platform: plat.platform,
              },
              data: {
                content: fullContent,
                status: "completed",
              },
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done", platform: plat.platform })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", projectId: project.id })}\n\n`
            )
          );
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Erreur de génération";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
        } finally {
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
