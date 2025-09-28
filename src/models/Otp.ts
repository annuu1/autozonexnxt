import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otpHash: string;
  purpose: string; // "register", "reset_password", "telegram_verify"
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  purpose: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
OtpSchema.index({ email: 1, purpose: 1, verified: 1 }); // For finding specific OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Prevent model overwrite during hot-reload
export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
