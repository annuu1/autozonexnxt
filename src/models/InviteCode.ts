// models/InviteCode.ts
import { Schema, model, models } from "mongoose";

const InviteCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

const InviteCode = models.InviteCode || model("InviteCode", InviteCodeSchema);

export default InviteCode;