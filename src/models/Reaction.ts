import mongoose, { Schema, models } from "mongoose";

const ReactionSchema = new Schema(
  {
    itemId: { type: String, required: true }, // zone, trade, alert id
    type: { type: String, required: true }, // "zone" | "trade" | "alert"
    userId: { type: String, required: true },
    reaction: { type: String, enum: ["👍", "👎", "🚀"], required: true },
    teamPick: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReactionSchema.index({ itemId: 1, userId: 1, type: 1 }, { unique: true });

const Reaction = models.Reaction || mongoose.model("Reaction", ReactionSchema);
export default Reaction;
