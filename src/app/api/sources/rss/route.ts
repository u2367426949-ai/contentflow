import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import { fetchRssFeed } from "@/lib/sources/rss";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Paramètre url requis" }, { status: 400 });
  }

  try {
    const feed = await fetchRssFeed(url);
    return NextResponse.json(feed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
