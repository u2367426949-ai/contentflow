import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getUserId } from "@/lib/auth";
import { getLinkedInAuthUrl } from "@/lib/linkedin";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  let authUrl: string;
  const state = randomBytes(16).toString("hex");
  try {
    authUrl = getLinkedInAuthUrl(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?linkedin=error&message=${encodeURIComponent(message)}`, req.url)
    );
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("li_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
