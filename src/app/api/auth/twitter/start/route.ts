import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getUserId } from "@/lib/auth";
import { getTwitterAuthUrl, generatePKCE } from "@/lib/twitter";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  let authUrl: string;
  const state = randomBytes(16).toString("hex");
  const { codeVerifier, codeChallenge } = generatePKCE();
  try {
    authUrl = getTwitterAuthUrl(state, codeChallenge);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?twitter=error&message=${encodeURIComponent(message)}`, req.url)
    );
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("tw_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set("tw_oauth_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
