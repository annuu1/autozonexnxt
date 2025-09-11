// hooks/useFeatureAccess.ts
import { features } from "@/config/features";

type FeatureReason =
  | "allowed"
  | "notFound"
  | "comingSoon"
  | "upgrade"
  | "disabled";

export const useFeatureAccess = (
  featureKey: keyof typeof features,
  user: any
) => {
  const feature = features[featureKey];

  if (!feature) return { allowed: false, reason: "notFound" };
  if (feature.comingSoon) return { allowed: false, reason: "comingSoon" };

  const isSubscribed = user?.subscription?.status === "active";
  if (feature.paid && !isSubscribed) return { allowed: false, reason: "upgrade" };

  if (!feature.enabled) return { allowed: false, reason: "disabled" };

  return { allowed: true, reason: "allowed" };
};
