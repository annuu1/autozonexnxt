import { features } from "@/config/features";

export const useFeatureAccess = (featureKey: keyof typeof features, user: any) => {
    const feature = features[featureKey];
    if (feature?.comingSoon) return { allowed: false, reason: "comingSoon" };
    if (feature?.paid && !user?.isSubscribed) return { allowed: false, reason: "upgrade" };
    return { allowed: feature.enabled, reason: null };
  };    
  