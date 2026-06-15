import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { exchangeLinkedInCode, getLinkedInProfile } from "@/lib/linkedin";
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
  const cookieState = req.cookies.get("li_oauth_state")?.value;

  function fail(message: string) {
    const res = NextResponse.redirect(
      new URL(`/dashboard/settings?linkedin=error&message=${encodeURIComponent(message)}`, req.url)
    );
    res.cookies.delete("li_oauth_state");
    return res;
  }

  if (oauthError) return fail(oauthError);
  if (!code || !state || !cookieState || state !== cookieState) {
    return fail("Requête OAuth invalide ou expirée, réessayez.");
  }

  try {
    const { accessToken, expiresIn } = await exchangeLinkedInCode(code);
    const profile = await getLinkedInProfile(accessToken);

    const user =
      (await prisma.user.findUnique({ where: { clerkId } })) ??
      (await prisma.user.create({ data: { clerkId } }));

    const socialAccountData = {
      accessTokenEnc: encrypt(accessToken),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      externalId: profile.sub,
      externalName: profile.name,
    };

    const existingAccount = await prisma.socialAccount.findUnique({
      where: { userId_platform: { userId: user.id, platform: "linkedin" } },
    });

    if (existingAccount) {
      await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: socialAccountData,
      });
    } else {
      await prisma.socialAccount.create({
        data: { userId: user.id, platform: "linkedin", ...socialAccountData },
      });
    }

    const res = NextResponse.redirect(new URL("/dashboard/settings?linkedin=connected", req.url));
    res.cookies.delete("li_oauth_state");
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("LinkedIn OAuth callback error:", message);
    return fail(message);
  }
}
