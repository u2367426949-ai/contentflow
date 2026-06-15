// Central source of truth for ContentFlow OS pricing tiers and plan limits.
// Vision V2: free → creator (29€) → pro (79€) → agency (199€).

export type Plan = "free" | "creator" | "pro" | "agency";

export interface PlanConfig {
  id: Plan;
  name: string;
  /** Monthly price in euros (0 = free). */
  price: number;
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
    genQuota: 5,
    brandVoices: 0,
    autoPublish: false,
    analytics: false,
  },
  creator: {
    id: "creator",
    name: "Creator",
    price: 29,
    genQuota: null,
    brandVoices: 1,
    autoPublish: true,
    analytics: false,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 79,
    genQuota: null,
    brandVoices: 3,
    autoPublish: true,
    analytics: true,
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: 199,
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
