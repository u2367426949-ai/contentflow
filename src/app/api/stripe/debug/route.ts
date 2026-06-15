import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {};

  const sk = process.env.STRIPE_SECRET_KEY;
  const pk = process.env.STRIPE_PRICE_ID;
  const ws = process.env.STRIPE_WEBHOOK_SECRET;
  const au = process.env.NEXT_PUBLIC_APP_URL;

  results.secret_key = sk ? `OK (${sk.slice(0, 8)}...)` : "MANQUANT";
  results.price_id = pk || "MANQUANT";
  results.webhook_secret = ws ? `OK (${ws.slice(0, 8)}...)` : "MANQUANT";
  results.app_url = au || "MANQUANT";

  if (!sk) {
    return NextResponse.json({ ...results, error: "STRIPE_SECRET_KEY manquant" });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(sk);

    const balance = await stripe.balance.retrieve();
    results.connection = "OK";

    if (pk) {
      try {
        const price = await stripe.prices.retrieve(pk);
        results.price = {
          id: price.id,
          type: price.type,
          recurring: price.recurring?.interval || "one-time",
          amount: price.unit_amount ? `${(price.unit_amount / 100).toFixed(2)} ${price.currency?.toUpperCase()}` : "N/A",
          active: price.active,
        };
      } catch (e) {
        results.price = `ERREUR: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
  } catch (e) {
    results.connection = `ERREUR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(results);
}
