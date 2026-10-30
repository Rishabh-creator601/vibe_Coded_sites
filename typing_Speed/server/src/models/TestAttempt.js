import mongoose from "mongoose";

const { Schema } = mongoose;

const TestAttemptSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: String, required: true },
    duration: { type: Number, enum: [60, 180, 300], required: true }, // seconds
    seed: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["started", "completed", "abandoned", "flagged"], default: "started" },
    flagReason: { type: String },

    startedAt: { type: Date, default: Date.now }, // when /start was called
    submittedAt: { type: Date },

    keystrokes: { type: [{ k: String, t: Number, _id: false }], select: false },

    netWpm: Number,
    rawWpm: Number,
    accuracy: Number,
    consistency: Number,
    chars: { correct: Number, incorrect: Number, extra: Number, missed: Number },
    errorsByKey: { type: Map, of: Number }, // keys encoded, see utils/keymap.js
    keyCounts: { type: Map, of: Number },
    wpmPerSecond: [{ s: Number, net: Number, raw: Number, errors: Number, _id: false }],
    levelPassed: { type: Boolean, default: false },
    newlyUnlocked: { type: [String], default: [] },
    personalBest: { type: Boolean, default: false },
  },
  { timestamps: true },
);

TestAttemptSchema.index({ user: 1, createdAt: -1 });
TestAttemptSchema.index({ user: 1, level: 1, duration: 1, netWpm: -1 });
TestAttemptSchema.index({ level: 1, duration: 1, status: 1, netWpm: -1 });
TestAttemptSchema.index({ status: 1, startedAt: 1 });

export default mongoose.models.TestAttempt || mongoose.model("TestAttempt", TestAttemptSchema);
