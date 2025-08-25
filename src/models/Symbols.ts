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
  },
  { timestamps: true }
);

const Symbol = models.Symbol || model("Symbol", symbolSchema);

export default Symbol;