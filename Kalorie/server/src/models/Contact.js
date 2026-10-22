import mongoose from 'mongoose';

// Messages submitted through the About Us contact form.
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    query: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', contactSchema);
