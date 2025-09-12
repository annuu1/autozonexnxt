export type Plan = "freemium" | "starter" | "pro";

export type FeatureConfig = {
  enabled: boolean;
  minPlan: Plan;
  comingSoon?: boolean;
};

export const features = {
  // Define feature access based on minimum plan required
  // Plans: freemium < starter < pro
  marketSummary: { enabled: true, minPlan: "starter" as const },
  zonesNearDayLow: { enabled: true, minPlan: "freemium" as const },
  advancedAnalytics: { enabled: false, comingSoon: true, minPlan: "pro" as const },
  alerts: { enabled: true, minPlan: "starter" as const },
  notifications: { enabled: false, comingSoon: true, minPlan: "starter" as const },
} as const;

export type FeatureKey = keyof typeof features;