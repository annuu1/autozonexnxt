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
        enum: ["active", "expired", "canceled"],
        default: "active",
      },
      startDate: { type: Date },
      endDate: { type: Date },
      billingCycle: {
        type: String,
        enum: ["weekly", "monthly", "quarterly", "yearly"],
        default: "weekly",
      },
    },

    isVerified: {
      type: Boolean,
      default: false, // email/phone verification
    },

    lastLogin: {
      type: Date,
    },
    
    // Single active session tracking
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;