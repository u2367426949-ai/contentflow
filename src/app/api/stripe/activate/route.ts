import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { PLANS, type PaidPlan } from "@/lib/plans";

function resolvePlanFromMetadata(plan: string | undefined): PaidPlan {
  if (plan && plan in PLANS && plan !== "free") return plan as PaidPlan;
  return "creator";
}

// Manual plan activation — checks Stripe for any completed checkout session
export async function POST(req: NextRequest) {
  const clerkId = await getUserId();
  if (!clerkId) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    // Find any completed checkout session with this clerkId in metadata
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    for (const session of sessions.data) {
      if (
        session.metadata?.clerkId === clerkId &&
        (session.payment_status === "paid" ||
          session.payment_status === "no_payment_required" ||
          session.status === "complete")
      ) {
        const plan = resolvePlanFromMetadata(session.metadata?.plan);

        await prisma.user.updateMany({
          where: { clerkId },
          data: {
            plan,
            stripeCustomerId: (session.customer as string) || undefined,
          },
        });

        return NextResponse.json({ success: true, plan });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Aucun paiement trouvé. Effectuez d'abord un paiement sur /upgrade.",
      },
      { status: 404 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
