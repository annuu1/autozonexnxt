// hooks/useRoleAccess.ts
import { features } from "@/config/features";

export function useRoleAccess(featureKey: keyof typeof features | null, user: any) {
    if (!featureKey) return { allowed: true };
  
    // Example mapping: which roles can access which features
    const roleFeatureMap: Record<string, string[]> = {
      trades: ["admin", "trader"],
      zonesReport: ["admin", "manager"],
      allZoneList: ["admin", "manager"],
      notifications: ["admin", "user"],
      users: ["admin"],
      activityLog: ["admin"],
    };
  
    const allowedRoles = roleFeatureMap[featureKey] || [];
    const allowed = user?.roles?.some((r: string) => allowedRoles.includes(r));
  
    return { allowed };
  }
  