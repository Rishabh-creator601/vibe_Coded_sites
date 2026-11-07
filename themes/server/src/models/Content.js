import mongoose from 'mongoose';

// The page's content as one document, so it can be edited in MongoDB without a redeploy.
const contentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const Content = mongoose.model('Content', contentSchema);
