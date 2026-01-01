export type Plan = "freemium" | "starter" | "pro";

export type FeatureConfig = {
  enabled: boolean;
  minPlan: Plan;
  comingSoon?: boolean;
  allowedRoles?: readonly string[];
};

export const features = {
  marketSummary: { 
    enabled: true,
    comingSoon: true,
    minPlan: "starter" as const,
    allowedRoles: ["admin", "manager", "agent", "user"], 
  },
  zonesNearDayLow: { 
    enabled: true,
    minPlan: "freemium" as const,
    allowedRoles: ["admin", "manager", "agent", "user"], 
  },
  advancedAnalytics: { 
    enabled: false,
    comingSoon: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  },
  latestZones: { 
    enabled: true,
    comingSoon: true,
    minPlan: "starter" as const,
    allowedRoles: ["admin","manager","user","associate"], 
  },
  scanner: { 
    enabled: true,
    comingSoon: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin","manager","user","associate"], 
  },
  alerts: { 
    enabled: true,
    minPlan: "freemium" as const,
    allowedRoles: ["admin", "manager", "agent"], 
  },
  notifications: { 
    enabled: false,
    comingSoon: true,
    minPlan: "starter" as const,
    allowedRoles: ["admin", "manager", "user"], 
  },
  journal: { 
    enabled: true,
    minPlan: "freemium" as const,
    allowedRoles: ["admin", "manager", "user", "associate"], 
  },
  zonesReport: { 
    enabled: true,
    minPlan: "freemium" as const,
    allowedRoles: ["admin", "manager", "user"], 
  },
  allZoneList: { 
    enabled: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  },
  users: {
    enabled: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  },
  activityLog:{
    enabled: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  },
  userActions:{
    enabled: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  },
  exclusive:{
    enabled: true,
    minPlan: "pro" as const,
    allowedRoles: ["admin"], 
  }
} as const;

export type FeatureKey = keyof typeof features;