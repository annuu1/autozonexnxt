// lib/logActivity.ts
import dbConnect from "@/lib/mongodb";
import ActivityLog from "@/models/ActivityLog";

export async function logActivity({
  userId,
  action,
  endpoint,
  method,
  ip,
  userAgent,
  metadata,
}: {
  userId: string;
  action: string;
  endpoint: string;
  method: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await dbConnect();
    await ActivityLog.create({
      userId,
      action,
      endpoint,
      method,
      ip,
      userAgent,
      metadata,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
