import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const generations = await prisma.generation.findMany({
    where: { project: { userId: user.id }, status: "completed" },
    include: { project: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = "Projet,Plateforme,Contenu,Ton,Date";
  const rows = generations.map((g) => {
    const content = `"${(g.content || "").replace(/"/g, '""')}"`;
    const title = `"${(g.project.title || "").replace(/"/g, '""')}"`;
    const date = new Date(g.createdAt).toISOString().slice(0, 10);
    return `${title},${g.platform},${content},${g.tone},${date}`;
  });

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=contentflow-posts.csv",
    },
  });
}
