import mongoose, { Schema, model, models } from "mongoose";

const tradeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // Core Trade Details
    position_type: { type: String, enum: ["Long", "Short"], required: true },
    trade_type: { type: String, enum: ["Scalp", "Swing", "Intraday", "Positional", "Long-term"] }, // e.g. Scalp, Swing
    quantity: { type: Number, required: true },
    entry_price: { type: Number, required: true },
    exit_price: { type: Number },
    stop_loss: { type: Number, required: true },
    target_price: { type: Number, required: true },
    timeframe: { type: String }, // 1m, 5m, 1h, etc.

    // Status
    status: { type: String, enum: ["Open", "Closed", "Pending", "SL Hit", "Target Hit"], default: "Open" },

    // Media & Metadata
    screenshots: [{ type: String }], // URLs
    tags: [{ type: String }],
    note: { type: String }, // General note

    // Pre-Trade Plan
    pre_trade: {
      reason: { type: String },
      zone: { type: String }, // Demand/Supply zone
      trend: { type: String }, // Higher timeframe trend
      confirmations: [{ type: String }],
      risk_per_trade: { type: Number }, // Amount or %
      setup_name: { type: String },
    },

    // Post-Trade Review
    post_trade: {
      followed_plan: { type: Boolean },
      mistakes: [{ type: String }],
      emotions: [{ type: String }], // Fear, Greed, FOMO, etc.
      lessons: { type: String },
      rating: { type: Number, min: 1, max: 5 },
    },

    // PnL & Financials
    pnl: {
      realised: { type: Number, default: 0 },
      unrealised: { type: Number, default: 0 },
      charges: { type: Number, default: 0 },
      net: { type: Number, default: 0 },
    },

    exit_date: { type: Date },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
tradeSchema.index({ userId: 1 });
tradeSchema.index({ symbol: 1 });
tradeSchema.index({ date: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ "pre_trade.setup_name": 1 });
tradeSchema.index({ tags: 1 });

const Trade = models.Trades || model("Trades", tradeSchema, "trades");

export default Trade;
