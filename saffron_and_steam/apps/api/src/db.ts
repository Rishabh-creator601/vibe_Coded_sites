import mongoose from "mongoose";

// Query filters built from request data can't carry operators like $gt or $where.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

export async function connectDb(uri: string): Promise<void> {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
