import mongoose, { Schema, models } from "mongoose";

const TeamPickSchema = new Schema(
  {
    itemId: { type: String, required: true },
    type: { type: String, required: true }, // "zone" | "trade" | "alert"
    addedBy: { type: String, required: true },
  },
  { timestamps: true }
);

TeamPickSchema.index({ itemId: 1, type: 1 }, { unique: true });

// Additional indexes for querying
TeamPickSchema.index({ addedBy: 1 }); // For finding picks by user
TeamPickSchema.index({ type: 1 }); // For filtering by type

const TeamPick = models.TeamPick || mongoose.model("TeamPick", TeamPickSchema);
export default TeamPick;
