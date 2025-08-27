import mongoose, { Schema, model, models } from "mongoose";

const tradeSchema = new Schema(
  {
    symbol: { type: String, required: true },
    _id: { type: Schema.Types.ObjectId, required: true },
    trade_type: { type: String, required: true },
    entry_price: { type: Number, required: true },
    stop_loss: { type: Number, required: true },
    target_price: { type: Number, required: true },
    status: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

const Trade = models.Trades || model("Trades", tradeSchema, "trades");

export default Trade;
