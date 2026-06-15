import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    const sessions = await stripe.checkout.sessions.list({ limit: 5 });

    const result = sessions.data.map((s) => ({
      id: s.id,
      mode: s.mode,
      status: s.status,
      payment_status: s.payment_status,
      metadata: s.metadata,
      customer: s.customer,
      subscription: s.subscription,
      created: new Date(s.created * 1000).toISOString(),
    }));

    return NextResponse.json({
      clerkId,
      total: sessions.data.length,
      sessions: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
