import mongoose from "mongoose";

const { Schema } = mongoose;

const PracticeSessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: String, required: true },
    option: { type: String, required: true }, // "time:30", "words:50", "passage", "untimed", "weak-drill"
    netWpm: Number,
    rawWpm: Number,
    accuracy: Number,
    durationMs: Number,
    charsTyped: Number,
    errorsByKey: { type: Map, of: Number }, // keys encoded, see utils/keymap.js
    keyCounts: { type: Map, of: Number },
    imported: { type: Boolean, default: false }, // true if imported from guest history
  },
  { timestamps: true },
);

PracticeSessionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.PracticeSession || mongoose.model("PracticeSession", PracticeSessionSchema);
