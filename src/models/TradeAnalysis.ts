import mongoose, { Schema, Document } from "mongoose";

export interface ITradeAnalysis extends Document {
  stock: string;
  status: "Entry Given" | "Running" | "Target Hit" | "Stoploss Hit";
  analysis: string;
  images: string[]; // multiple timeframe chart links
  date: Date;
}

const TradeAnalysisSchema = new Schema<ITradeAnalysis>(
  {
    stock: { type: String, required: true },
    status: {
      type: String,
      enum: ["Analysis Only", "Entry Given", "Running", "Target Hit", "Stoploss Hit"],
      required: true,
    },
    analysis: { type: String, required: true },
    images: [{ type: String, required: true }],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev mode
export default mongoose.models.TradeAnalysis ||
  mongoose.model<ITradeAnalysis>("TradeAnalysis", TradeAnalysisSchema);
