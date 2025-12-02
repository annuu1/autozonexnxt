// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true, // hashed password (bcrypt/argon2)
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    roles: {
      type: [String],
      enum: ["user", "agent", "manager", "admin", "associate"],
      default: ["user"],
    },

    permissions: {
      type: [String], // Flexible fine-grained permissions (e.g., "notes:write")
      default: [],
    },

    subscription: {
      plan: {
        type: String,
        enum: ["freemium", "starter", "pro"],
        default: "freemium",
      },
      status: {
        type: String,
        enum: ["active", "expired", "canceled", "inactive"],
        default: "active",
      },
      startDate: { type: Date },
      endDate: { type: Date },
      billingCycle: {
        type: String,
        enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
        default: "daily",
      },
      telegramAccessStatus: {
        type: String,
        enum: ["pending", "granted", "revoked", "failed"],
        default: "pending",
      },
      telegramInviteLink: { type: String },
      telegramAccessExpiry: { type: Date },
    },

    isVerified: {
      type: Boolean,
      default: false, // email/phone verification
    },

    lastLogin: {
      type: Date,
    },

    other_channels: [{
      _id: false,
      channel: {
        type: String,
        required: true,
        trim: true,
      },
      id: {
        type: String, // Change to Number if IDs are numeric (e.g., Telegram chat IDs)
        required: true,
      },
    }],

    // Single active session tracking
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
UserSchema.index({ invitedBy: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
UserSchema.index({ 'other_channels.channel': 1, 'other_channels.id': 1 });

const User = models.User || model("User", UserSchema);

export default User;