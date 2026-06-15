import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, plan: "pro" },
      update: { plan: "pro" },
    });

    return NextResponse.json({ success: true, plan: "pro" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
