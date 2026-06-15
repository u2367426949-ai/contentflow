import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { exchangeTwitterCode, getTwitterProfile } from "@/lib/twitter";
import { encrypt } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const cookieState = req.cookies.get("tw_oauth_state")?.value;
  const codeVerifier = req.cookies.get("tw_oauth_verifier")?.value;

  function fail(message: string) {
    const res = NextResponse.redirect(
      new URL(`/dashboard/settings?twitter=error&message=${encodeURIComponent(message)}`, req.url)
    );
    res.cookies.delete("tw_oauth_state");
    res.cookies.delete("tw_oauth_verifier");
    return res;
  }

  if (oauthError) return fail(oauthError);
  if (!code || !state || !cookieState || !codeVerifier || state !== cookieState) {
    return fail("Requête OAuth invalide ou expirée, réessayez.");
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeTwitterCode(code, codeVerifier);
    const profile = await getTwitterProfile(accessToken);

    const user =
      (await prisma.user.findUnique({ where: { clerkId } })) ??
      (await prisma.user.create({ data: { clerkId } }));

    const socialAccountData = {
      accessTokenEnc: encrypt(accessToken),
      refreshTokenEnc: encrypt(refreshToken),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      externalId: profile.id,
      externalName: profile.name || profile.username,
    };

    const existingAccount = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: "twitter" } },
    });

    if (existingAccount) {
      await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: socialAccountData,
      });
    } else {
      await prisma.socialAccount.create({
        data: { userId: user.id, platform: "twitter", ...socialAccountData },
      });
    }

    const res = NextResponse.redirect(new URL("/dashboard/settings?twitter=connected", req.url));
    res.cookies.delete("tw_oauth_state");
    res.cookies.delete("tw_oauth_verifier");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Twitter OAuth callback error:", message);
    return fail(message);
  }
}
