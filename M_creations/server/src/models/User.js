import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Google doesn't share this, so Google sign-ups give it on the site after their first login.
    phone: { type: String, default: null },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return { id: this.id, name: this.name, email: this.email, phone: this.phone, role: this.role };
};

export const User = mongoose.model('User', userSchema);
