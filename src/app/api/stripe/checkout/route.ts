import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

const PRICE_ID = process.env.STRIPE_PRICE_ID || "price_pro_19eur";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://contentflow-ai-node-ia.vercel.app";

export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // Dynamic import to avoid bundling issues with ESM
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        clerkId,
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
