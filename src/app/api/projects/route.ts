import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { extractUrlContent } from "@/lib/url-extractor";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
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
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { originalUrl, sourceText } = await req.json();

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId },
      });
    }

    let text = sourceText || "";
    let title = "Sans titre";

    if (originalUrl) {
      try {
        text = await extractUrlContent(originalUrl);
        // Extract a title from the URL or content
        const urlObj = new URL(originalUrl);
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        title =
          pathParts
            .pop()
            ?.replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || "Article importé";
      } catch (err) {
        return NextResponse.json(
          { error: "Impossible d'extraire le contenu de cette URL" },
          { status: 400 }
        );
      }
    }

    const project = await prisma.contentProject.create({
      data: {
        userId: user.id,
        title,
        originalUrl: originalUrl || null,
        sourceText: text || null,
        generations: {
          createMany: {
            data: [
              { platform: "linkedin", tone: "professionnel" },
              { platform: "twitter", tone: "concis" },
              { platform: "instagram", tone: "engageant" },
            ],
          },
        },
      },
      include: {
        generations: {
          select: { platform: true, status: true },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("Create project error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}
