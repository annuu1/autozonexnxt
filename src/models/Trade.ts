import mongoose, { Schema, model, models } from "mongoose";

const tradeSchema = new Schema(
  {
    symbol: { type: String, required: true },
    trade_type: { type: String, required: true },
    entry_price: { type: Number, required: true },
    stop_loss: { type: Number, required: true },
    target_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
tradeSchema.index({ symbol: 1 });
tradeSchema.index({ trade_type: 1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ symbol: 1, status: 1 });

const Trade = models.Trades || model("Trades", tradeSchema, "trades");

export default Trade;
