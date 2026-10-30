import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    passedLevels: { type: [String], default: [] },
    settings: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      sound: { type: Boolean, default: false },
      fontSize: { type: String, enum: ["sm", "md", "lg"], default: "md" },
    },
    // running totals so the dashboard doesn't need a full scan
    stats: {
      testsCompleted: { type: Number, default: 0 },
      practiceSessions: { type: Number, default: 0 },
      timeTypingMs: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  passedLevels: u.passedLevels,
  settings: { theme: u.settings.theme, sound: u.settings.sound, fontSize: u.settings.fontSize },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
