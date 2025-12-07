import mongoose, { Schema, model, models } from "mongoose";

const symbolSchema = new Schema(
  {
    symbol: { type: String, required: true },
    _id: { type: Schema.Types.ObjectId, required: true },
    ltp: { type: Number },
    sectors: [{ type: String }],
    watchlists: [{ type: String }],
    company_name: { type: String },
    last_updated: { type: Date },
    day_low: { type: Number },
    updated_at: { type: Date },
    status: { type: String },
    is_liquid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
symbolSchema.index({ symbol: 1 }, { unique: true });
symbolSchema.index({ sectors: 1 });
symbolSchema.index({ watchlists: 1 });
symbolSchema.index({ company_name: 1 });

const Symbol = models.Symbol || model("Symbol", symbolSchema);

export default Symbol;