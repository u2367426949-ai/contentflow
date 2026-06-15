import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { extractUrlContent } from "@/lib/url-extractor";
import { extractYouTubeTranscript } from "@/lib/sources/youtube";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const projects = await prisma.contentProject.findMany({
    where: {
      user: { clerkId: userId },
    },
    include: {
      generations: {
        select: { platform: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { originalUrl, sourceText, sourceType, title: providedTitle } =
      (await req.json()) as {
        originalUrl?: string;
        sourceText?: string;
        sourceType?: "url" | "youtube" | "text";
        title?: string;
      };

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId },
      });
    }

    let text = sourceText || "";
    let title = providedTitle?.trim() || "Sans titre";

    if (sourceType === "youtube" && originalUrl) {
      // YouTube transcript ingestion.
      try {
        const extracted = await extractYouTubeTranscript(originalUrl);
        text = extracted.text;
        title = extracted.title || "Vidéo YouTube";
      } catch (e) {
        return NextResponse.json(
          {
            error:
              e instanceof Error
                ? e.message
                : "Impossible de récupérer le transcript YouTube",
          },
          { status: 400 }
        );
      }
    } else if (sourceType === "text") {
      // Pasted text / uploaded document already provides sourceText.
      title = providedTitle?.trim() || "Document";
    } else if (originalUrl) {
      // Default: article URL (also used for RSS-selected items).
      try {
        const extracted = await extractUrlContent(originalUrl);
        text = extracted.text;
        title =
          extracted.title ||
          originalUrl.split("/").pop()?.replace(/-/g, " ") ||
          originalUrl;
      } catch {
        text = `URL: ${originalUrl}`;
        title = originalUrl.split("/").pop()?.replace(/-/g, " ") || originalUrl;
      }
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Impossible d'extraire le contenu de cette source" },
        { status: 400 }
      );
    }
    // Create the project (without nested create to avoid transactions)
    const project = await prisma.contentProject.create({
      data: {
        userId: user.id,
        title,
        originalUrl: originalUrl || null,
        sourceText: text,
      },
    });

    // Create generations individually (createMany uses transactions, not supported in HTTP mode)
    for (const platform of ["linkedin", "twitter", "instagram"]) {
      await prisma.generation.create({
        data: {
          projectId: project.id,
          platform,
          status: "pending",
        },
      });
    }

    // Fetch the complete project with generations
    const completeProject = await prisma.contentProject.findUnique({
      where: { id: project.id },
      include: { generations: true },
    });

    return NextResponse.json(completeProject, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error creating project:", message);
    return NextResponse.json(
      { error: `Erreur: ${message}` },
      { status: 500 }
    );
  }
}
