import { Schema, model, models, Document, Types } from "mongoose";

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  telegramChatId: string;
  telegramUsername?: string;
  telegramAccessStatus: "pending" | "granted" | "revoked" | "failed";
  telegramInviteLink?: string;
  telegramAccessExpiry?: Date;
  plan: string;
  billingCycle: string;
  amount: number;
  transactionId?: string;
  startDate: Date;
  expiryDate: Date;
  isAutoRenew: boolean;
  features: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    telegramChatId: { type: String },
    telegramUsername: { type: String },
    telegramAccessStatus: {
      type: String,
      enum: ["pending", "granted", "revoked", "failed"],
      default: "pending",
    },
    telegramInviteLink: { type: String },
    telegramAccessExpiry: { type: Date },
    plan: { type: String, default: "starter" },
    billingCycle: { type: String, default: "monthly" },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    isAutoRenew: { type: Boolean, default: false },
    features: { type: [String], default: [] },
    notes: { type: String },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const Subscription =
  models.Subscription || model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
