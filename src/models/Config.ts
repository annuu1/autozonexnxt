import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { 
    timestamps: true,
    collection: "config" // <-- FORCE COLLECTION NAME
  }
);

export default mongoose.models.Config || mongoose.model("Config", ConfigSchema);
