import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getPriceId, type PaidPlan } from "@/lib/plans";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contentflow-ai-node-ia.vercel.app";
const VALID_PLANS: PaidPlan[] = ["creator", "pro", "agency"];

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let plan: PaidPlan = "creator";
  try {
    const body = await req.json();
    if (VALID_PLANS.includes(body?.plan)) {
      plan = body.plan;
    }
  } catch {
    // No body provided — default to Creator.
  }

  const priceId = getPriceId(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `Le plan ${plan} n'est pas configuré (price ID manquant).` },
      { status: 500 }
    );
  }

  try {
    // Dynamic import to avoid bundling issues with ESM
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        clerkId,
        plan,
      },
      subscription_data: {
        metadata: {
          clerkId,
          plan,
        },
      },
      success_url: `${APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/upgrade?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
