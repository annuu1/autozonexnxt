// models/Note.ts
import { Schema, model, models } from "mongoose";

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    demandZoneId: {
      type: Schema.Types.ObjectId,
      ref: "DemandZone",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
NoteSchema.index({ userId: 1 });
NoteSchema.index({ demandZoneId: 1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ isPinned: 1 });

const Note = models.Note || model("Note", NoteSchema);

export default Note;
