import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import openai from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId requis" },
        { status: 400 }
      );
    }

    const project = await prisma.contentProject.findFirst({
      where: {
        id: projectId,
        user: { clerkId },
      },
      include: { generations: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    if (!project.sourceText) {
      return NextResponse.json(
        { error: "Le projet n'a pas de contenu source. Vérifiez l'URL fournie." },
        { status: 400 }
      );
    }

    // Reset generations to pending
    await prisma.generation.updateMany({
      where: { projectId: project.id },
      data: { status: "pending", content: null },
    });

    const sourceText = project.sourceText;

    // === STEP 1: Extract key points ===
    const keyPointsCompletion = await openai.chat.completions.create({
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
    });

    const keyPointsRaw = keyPointsCompletion.choices[0]?.message?.content || "{}";
    let keyPoints: string[];
    try {
      const parsed = JSON.parse(keyPointsRaw);
      keyPoints = parsed.keyPoints || [];
    } catch {
      keyPoints = [];
    }

    const keyPointsText = keyPoints.length > 0
      ? keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")
      : "Points clés non disponibles.";

    // === STEP 2: Generate posts for each platform ===
    const platforms: { platform: string; tone: string; instructions: string }[] = [
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

    const results: { platform: string; content: string }[] = [];

    for (const plat of platforms) {
      const completion = await openai.chat.completions.create({
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
      });

      const content = completion.choices[0]?.message?.content || "";

      // Update generation in DB
      await prisma.generation.updateMany({
        where: {
          projectId: project.id,
          platform: plat.platform,
        },
        data: {
          content,
          status: "completed",
        },
      });

      results.push({ platform: plat.platform, content });
    }

    // Fetch updated generations
    const updatedGenerations = await prisma.generation.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      projectId: project.id,
      generations: updatedGenerations,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
