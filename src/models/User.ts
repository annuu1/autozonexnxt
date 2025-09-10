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

    passwordHash: {
      type: String,
      required: true, // hashed password (bcrypt/argon2)
    },

    roles: {
      type: [String],
      enum: ["user", "agent", "manager", "admin"],
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
    },

    isVerified: {
      type: Boolean,
      default: false, // email/phone verification
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
