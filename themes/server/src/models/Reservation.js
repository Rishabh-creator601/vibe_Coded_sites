import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    coffee: { type: String, required: true },
    grind: { type: String, required: true },
    batchDate: { type: Date, required: true, index: true },
    code: { type: String, required: true },
  },
  { timestamps: true },
);

// One reservation per person, per coffee, per roast.
reservationSchema.index({ email: 1, coffee: 1, batchDate: 1 }, { unique: true });

export const Reservation = mongoose.model('Reservation', reservationSchema);
