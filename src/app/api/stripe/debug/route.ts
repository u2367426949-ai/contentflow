import { NextRequest, NextResponse } from "next/server";
import { PLAN_PRICE_ENV, type PaidPlan } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {};

  const sk = process.env.STRIPE_SECRET_KEY;
  const ws = process.env.STRIPE_WEBHOOK_SECRET;
  const au = process.env.NEXT_PUBLIC_APP_URL;

  results.secret_key = sk ? `OK (${sk.slice(0, 8)}...)` : "MANQUANT";
  results.webhook_secret = ws ? `OK (${ws.slice(0, 8)}...)` : "MANQUANT";
  results.app_url = au || "MANQUANT";

  const prices: Record<string, unknown> = {};

  if (!sk) {
    for (const [plan, envVar] of Object.entries(PLAN_PRICE_ENV)) {
      prices[plan] = process.env[envVar] || "MANQUANT";
    }
    results.prices = prices;
    return NextResponse.json({ ...results, error: "STRIPE_SECRET_KEY manquant" });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(sk);

    const balance = await stripe.balance.retrieve();
    results.connection = "OK";

    for (const [plan, envVar] of Object.entries(PLAN_PRICE_ENV) as [PaidPlan, string][]) {
      const priceId = process.env[envVar];
      if (!priceId) {
        prices[plan] = "MANQUANT";
        continue;
      }
      try {
        const price = await stripe.prices.retrieve(priceId);
        prices[plan] = {
          id: price.id,
          type: price.type,
          recurring: price.recurring?.interval || "one-time",
          amount: price.unit_amount ? `${(price.unit_amount / 100).toFixed(2)} ${price.currency?.toUpperCase()}` : "N/A",
          active: price.active,
        };
      } catch (e) {
        prices[plan] = `ERREUR: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    results.prices = prices;
  } catch (e) {
    results.connection = `ERREUR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(results);
}
