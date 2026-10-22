import mongoose from 'mongoose';

// A single food item logged against a user, a date and a meal.
const foodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Stored as 'YYYY-MM-DD' so a "day" is unambiguous regardless of timezone.
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },

    meal: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },

    foodName: { type: String, required: true, trim: true },
    servingSize: { type: String, required: true, trim: true }, // e.g. "1 cup", "100 g"

    calories: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 }, // grams
    protein: { type: Number, required: true, min: 0 }, // grams
  },
  { timestamps: true }
);

// Fast lookups for "everything this user ate on this day".
foodEntrySchema.index({ user: 1, date: 1 });

foodEntrySchema.methods.toClientJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  delete obj.user;
  return obj;
};

export default mongoose.model('FoodEntry', foodEntrySchema);
