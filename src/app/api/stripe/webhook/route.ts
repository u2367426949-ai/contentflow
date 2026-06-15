import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PLANS, getPlanFromPriceId, type PaidPlan } from "@/lib/plans";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

function resolvePlanFromMetadata(plan: string | undefined): PaidPlan {
  if (plan && plan in PLANS && plan !== "free") return plan as PaidPlan;
  return "creator";
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const clerkId = session.metadata?.clerkId;
        const plan = resolvePlanFromMetadata(session.metadata?.plan);

        if (clerkId) {
          const customerId = session.customer as string;
          const existingUser = await prisma.user.findUnique({ where: { clerkId } });
          if (existingUser) {
            await prisma.user.update({
              where: { clerkId },
              data: { plan, stripeCustomerId: customerId || undefined },
            });
          } else {
            await prisma.user.create({
              data: { clerkId, plan, stripeCustomerId: customerId || "" },
            });
          }
          console.log(`✅ Plan upgraded to ${plan} for clerkId: ${clerkId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        // Handles upgrades/downgrades made via the billing portal.
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : null;

        if (customerId && plan && subscription.status === "active") {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan },
          });
          console.log(`🔄 Plan updated to ${plan} for customer: ${customerId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Find user by Stripe customer ID and downgrade
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        if (customerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: "free" },
          });
          console.log(`⬇️ Plan downgraded to free for customer: ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
