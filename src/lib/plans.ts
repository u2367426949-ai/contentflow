// Central source of truth for ContentFlow OS pricing tiers and plan limits.
// Vision V2: free → creator (29€) → pro (79€) → agency (199€).

export type Plan = "free" | "creator" | "pro" | "agency";

export interface PlanConfig {
  id: Plan;
  name: string;
  /** Monthly price in euros (0 = free). */
  price: number;
  /** Yearly price in euros, billed once (0 = free). ~2 months off the monthly rate. */
  yearlyPrice: number;
  /** Monthly generation quota. null = unlimited. */
  genQuota: number | null;
  /** How many brand voices the plan can store. 0 = feature locked. */
  brandVoices: number;
  /** Whether the plan can auto-publish (real publishing) and schedule. */
  autoPublish: boolean;
  /** Whether the plan unlocks the performance analytics loop. */
  analytics: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    genQuota: 5,
    brandVoices: 0,
    autoPublish: false,
    analytics: false,
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 29,
    yearlyPrice: 290,
    genQuota: null,
    brandVoices: 1,
    autoPublish: true,
    analytics: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    yearlyPrice: 790,
    genQuota: null,
    brandVoices: 3,
    autoPublish: true,
    analytics: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 199,
    yearlyPrice: 1990,
    genQuota: null,
    brandVoices: 10,
    autoPublish: true,
    analytics: true,
  },
};

/** Resolve a (possibly unknown/legacy) plan string to a known config. */
export function getPlan(plan: string | null | undefined): PlanConfig {
  if (plan && plan in PLANS) return PLANS[plan as Plan];
  return PLANS.free;
}

/** True when the plan is paid (anything above free). */
export function isPaid(plan: string | null | undefined): boolean {
  return getPlan(plan).id !== "free";
}

/** Paid plans that map to a real Stripe subscription price. */
export type PaidPlan = "creator" | "pro" | "agency";

export type BillingInterval = "month" | "year";

/** Env var names holding each plan's Stripe Price ID (monthly billing). */
export const PLAN_PRICE_ENV: Record<PaidPlan, string> = {
  creator: "STRIPE_PRICE_CREATOR",
  pro: "STRIPE_PRICE_PRO",
  agency: "STRIPE_PRICE_AGENCY",
};

/** Env var names holding each plan's Stripe Price ID (yearly billing). */
export const PLAN_PRICE_ENV_YEARLY: Record<PaidPlan, string> = {
  creator: "STRIPE_PRICE_CREATOR_YEARLY",
  pro: "STRIPE_PRICE_PRO_YEARLY",
  agency: "STRIPE_PRICE_AGENCY_YEARLY",
};

/** Read the Stripe Price ID configured for a paid plan + billing interval, if any. */
export function getPriceId(plan: PaidPlan, interval: BillingInterval = "month"): string | null {
  const envVar = interval === "year" ? PLAN_PRICE_ENV_YEARLY[plan] : PLAN_PRICE_ENV[plan];
  return process.env[envVar] || null;
}

/** Reverse-lookup: map a Stripe Price ID back to one of our paid plans (monthly or yearly). */
export function getPlanFromPriceId(priceId: string): PaidPlan | null {
  for (const [plan, envVar] of Object.entries(PLAN_PRICE_ENV)) {
    if (process.env[envVar] === priceId) return plan as PaidPlan;
  }
  for (const [plan, envVar] of Object.entries(PLAN_PRICE_ENV_YEARLY)) {
    if (process.env[envVar] === priceId) return plan as PaidPlan;
  }
  return null;
}
