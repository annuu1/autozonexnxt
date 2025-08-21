import mongoose, { Schema, model, models } from "mongoose";

const demandZoneSchema = new Schema(
  {
    zone_id: { type: String, required: true, unique: true },
    base_candles: { type: Number, required: true },
    coinciding_lower_zones: { type: [String], default: [] },
    distal_line: { type: Number, required: true },
    end_timestamp: { type: Date, required: true },
    freshness: { type: Number, required: true },
    parent_zone_id: { type: String, default: null },
    pattern: { type: String, required: true },
    proximal_line: { type: Number, required: true },
    ticker: { type: String, required: true },
    timeframes: { type: [String], required: true },
    timestamp: { type: Date, required: true },
    trade_score: { type: Number, required: true },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

const DemandZone =
  models.DemandZone || model("DemandZone", demandZoneSchema, "demand_zones");

export default DemandZone;
