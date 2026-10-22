import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },

    // Profile used to compute the calorie target
    gender: { type: String, enum: ['male', 'female'], required: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    heightCm: { type: Number, required: true, min: 50, max: 260 },
    weightKg: { type: Number, required: true, min: 10, max: 500 },
    dietType: { type: String, enum: ['veg', 'non-veg'], required: true },
    country: { type: String, default: 'India', trim: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'sedentary',
    },

    // Optional avatar, stored as a small base64 data URL
    profilePicture: { type: String, default: '' },

    // Derived goals
    targetCalories: { type: Number, required: true },
    proteinTarget: { type: Number, required: true },
    carbsTarget: { type: Number, required: true },
  },
  { timestamps: true }
);

// Never leak the password hash to the client.
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('User', userSchema);
