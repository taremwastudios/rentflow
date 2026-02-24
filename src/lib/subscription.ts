import { db } from "@/db";
import { subscriptions, subscriptionPlans, properties, units } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export interface SubscriptionLimits {
  propertyLimit: number;
  unitLimit: number;
  storageGb: number;
  prioritySupport: boolean;
  priorityMultiplier: number;
  planName: string;
}

export interface UsageStats {
  propertyCount: number;
  unitCount: number;
  canAddProperty: boolean;
  canAddUnit: boolean;
  remainingProperties: number;
  remainingUnits: number;
}

// Default free plan limits (fallback if no subscription)
const FREE_PLAN_LIMITS: SubscriptionLimits = {
  propertyLimit: 1,
  unitLimit: 3,
  storageGb: 1,
  prioritySupport: false,
  priorityMultiplier: 1,
  planName: "Free",
};

/**
 * Get user's current subscription with plan details
 */
export async function getUserSubscription(userId: number) {
  try {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return { subscription: null, plan: null, limits: FREE_PLAN_LIMITS };
    }

    const sub = subscription[0];
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, sub.planId))
      .limit(1);

    if (plan.length === 0) {
      return { subscription: sub, plan: null, limits: FREE_PLAN_LIMITS };
    }

    const currentPlan = plan[0];
    const limits: SubscriptionLimits = {
      propertyLimit: currentPlan.propertyLimit,
      unitLimit: currentPlan.unitLimit,
      storageGb: currentPlan.storageGb,
      prioritySupport: currentPlan.prioritySupport,
      priorityMultiplier: currentPlan.priorityMultiplier,
      planName: currentPlan.name,
    };

    return { subscription: sub, plan: currentPlan, limits };

  } catch (error) {
    console.error("Error getting user subscription:", error);
    return { subscription: null, plan: null, limits: FREE_PLAN_LIMITS };
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: number): Promise<UsageStats> {
  try {
    // Get current subscription limits
    const { limits } = await getUserSubscription(userId);

    // Count current properties
    const propertyCountResult = await db
      .select({ count: properties.id })
      .from(properties)
      .where(eq(properties.landlordId, userId));

    const propertyCount = propertyCountResult.length;

    // Count current units across all properties
    const unitCountResult = await db
      .select({ count: units.id })
      .from(units)
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.landlordId, userId));

    const unitCount = unitCountResult.length;

    // Calculate remaining
    const propertyLimit = limits.propertyLimit === -1 ? Infinity : limits.propertyLimit;
    const unitLimit = limits.unitLimit === -1 ? Infinity : limits.unitLimit;

    return {
      propertyCount,
      unitCount,
      canAddProperty: propertyCount < propertyLimit,
      canAddUnit: unitCount < unitLimit,
      remainingProperties: propertyLimit === Infinity ? Infinity : propertyLimit - propertyCount,
      remainingUnits: unitLimit === Infinity ? Infinity : unitLimit - unitCount,
    };

  } catch (error) {
    console.error("Error getting user usage stats:", error);
    // Return safe defaults
    return {
      propertyCount: 0,
      unitCount: 0,
      canAddProperty: true,
      canAddUnit: true,
      remainingProperties: Infinity,
      remainingUnits: Infinity,
    };
  }
}

/**
 * Check if user can add another property
 */
export async function canUserAddProperty(userId: number): Promise<boolean> {
  const stats = await getUserUsageStats(userId);
  return stats.canAddProperty;
}

/**
 * Check if user can add another unit to a specific property
 */
export async function canUserAddUnit(userId: number, propertyId?: number): Promise<boolean> {
  const stats = await getUserUsageStats(userId);
  return stats.canAddUnit;
}

/**
 * Get upgrade prompt message if limits exceeded
 */
export async function getUpgradePrompt(userId: number): Promise<string | null> {
  const { limits } = await getUserSubscription(userId);
  const stats = await getUserUsageStats(userId);

  if (!stats.canAddProperty) {
    return `You've reached your property limit (${limits.propertyLimit}) on the ${limits.planName} plan. Upgrade to add more properties.`;
  }

  if (!stats.canAddUnit) {
    return `You've reached your unit limit (${limits.unitLimit}) on the ${limits.planName} plan. Upgrade to add more units.`;
  }

  return null;
}
