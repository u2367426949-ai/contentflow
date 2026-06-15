import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

// Find the user's most recent completed Stripe session and activate Pro
export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    // List recent sessions (Stripe returns newest first by default)
    const sessions = await stripe.checkout.sessions.list({ limit: 10 });

    let activated = false;
    let sessionInfo = null;

    for (const session of sessions.data) {
      // Match by clerkId in metadata
      if (session.metadata?.clerkId !== clerkId) continue;

      // Check if payment is valid
      const isValid =
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required" ||
        (session.status === "complete" && session.subscription);

      if (isValid) {
        // Ensure user exists, then update
        await prisma.user.upsert({
          where: { clerkId },
          create: {
            clerkId,
            plan: "pro",
            stripeCustomerId: (session.customer as string) || "",
          },
          update: {
            plan: "pro",
            stripeCustomerId: (session.customer as string) || undefined,
          },
        });

        activated = true;
        sessionInfo = {
          id: session.id,
          mode: session.mode,
          status: session.status,
          payment_status: session.payment_status,
        };
        break;
      }
    }

    if (activated) {
      return NextResponse.json({ success: true, plan: "pro", session: sessionInfo });
    }

    // Return what we found for debugging
    const allSessions = sessions.data
      .filter((s) => s.metadata?.clerkId === clerkId)
      .map((s) => ({
        id: s.id,
        status: s.status,
        payment_status: s.payment_status,
        created: new Date(s.created * 1000).toISOString(),
      }));

    return NextResponse.json({
      success: false,
      message: "Aucun paiement validé trouvé.",
      yourSessions: allSessions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Activation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
