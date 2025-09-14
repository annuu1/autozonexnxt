// hooks/useFeatureAccess.ts
import { features } from "@/config/features";

type FeatureReason =
  | "allowed"
  | "notFound"
  | "comingSoon"
  | "upgrade"
  | "disabled"
  | "expired"
  | "forbiddenRole";

export const useFeatureAccess = (
  featureKey: keyof typeof features,
  user: any
) => {
  const feature = features[featureKey];

  if (!feature) return { allowed: false, reason: "notFound" };
  if ("comingSoon" in feature && feature.comingSoon) return { allowed: false, reason: "comingSoon" };

  // Subscription status and expiry check (skip for freemium-only features)
  const sub = user?.subscription;
  const minPlan: string = feature.minPlan;
  if (minPlan !== "freemium") {
    const isActive = sub?.status === "active";
    // Derive endDate from billingCycle if not provided
    let endDate: Date | null = null;
    if (sub?.endDate) {
      endDate = new Date(sub.endDate);
    } else if (sub?.startDate && sub?.billingCycle) {
      const start = new Date(sub.startDate);
      const d = new Date(start);
      if (sub.billingCycle === "monthly") d.setMonth(d.getMonth() + 1);
      else if (sub.billingCycle === "quarterly") d.setMonth(d.getMonth() + 3);
      else if (sub.billingCycle === "yearly") d.setFullYear(d.getFullYear() + 1);
      endDate = d;
    }
    const now = new Date();
    const isExpired = endDate ? endDate.getTime() < now.getTime() : false;
    if (!isActive || isExpired) return { allowed: false, reason: "expired" };
  }

  // Plan tier check
  const planRank: Record<string, number> = { freemium: 0, starter: 1, pro: 2 };
  const userPlan: string = sub?.plan ?? "freemium";
  if ((planRank[userPlan] ?? 0) < (planRank[minPlan] ?? 0)) {
    return { allowed: false, reason: "upgrade" };
  }

    // ✅ Role-based check
    const allowedRoles: readonly string[] = feature.allowedRoles || ["user"]; // default
    const userRoles: string[] = user?.roles || ["user"];
    const hasRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return { allowed: false, reason: "forbiddenRole" };
    }

  if (!feature.enabled) return { allowed: false, reason: "disabled" };

  return { allowed: true, reason: "allowed" };
};
