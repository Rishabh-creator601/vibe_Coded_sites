import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp } from './app.js';

await mongoose.connect(config.mongoUri);
createApp().listen(config.port, () => {
  console.log(`M Creations API running on http://localhost:${config.port}`);
});
