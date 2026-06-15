import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "Aucun abonnement trouvé." }, { status: 404 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
      });

      return NextResponse.json({ url: session.url });
    } catch (e) {
      const isMissingCustomer =
        e instanceof Stripe.errors.StripeInvalidRequestError &&
        e.code === "resource_missing" &&
        e.param === "customer";

      if (!isMissingCustomer) throw e;

      // Stale customer ID (e.g. from a different Stripe mode/account) — clear it
      // so the user can re-subscribe via /upgrade to get a valid one.
      await prisma.user.update({
        where: { clerkId },
        data: { stripeCustomerId: null },
      });

      return NextResponse.json(
        {
          error:
            "Votre lien de facturation est obsolète et a été réinitialisé. Repassez par /upgrade pour vous abonner et accéder au portail de facturation.",
        },
        { status: 409 }
      );
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
