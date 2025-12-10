// models/ActivityLog.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: string;
  action: string;
  endpoint: string;
  method: string;
  ip: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: String, required: true },
    action: { type: String, required: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    metadata: { type: Object },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Add indexes for frequently queried fields
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ endpoint: 1 });
// Add TTL index to automatically delete logs older than 7 days (604800 seconds)
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
