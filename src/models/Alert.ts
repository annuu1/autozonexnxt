import mongoose, { Schema, Document, models } from "mongoose";

export interface IAlert extends Document {
  userId: string;           // Owner of the alert (from authentication)
  symbol: string;           // Stock symbol (e.g. AAPL)
  condition: "Above" | "Below";
  price: number;
  active: boolean;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: { type: String, required: true },
    symbol: { type: String, required: true },
    condition: { type: String, enum: ["Above", "Below"], required: true },
    price: { type: Number, required: true },
    active: { type: Boolean, default: true },
    note: { type: String },
  },
  { timestamps: true }
);

const Alert = models.Alert || mongoose.model<IAlert>("Alert", AlertSchema);
export default Alert;
