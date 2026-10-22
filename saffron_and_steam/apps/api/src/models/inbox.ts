import { model, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true },
    topic: { type: String, enum: ["general", "booking", "order", "events", "feedback"], default: "general" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

export const MessageModel = model("Message", messageSchema);
export const SubscriberModel = model("Subscriber", subscriberSchema);
