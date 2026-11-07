import './env.js';
import { createApp } from './app.js';
import { connectWithRetry } from './db.js';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odd-hour';

createApp().listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
connectWithRetry(MONGODB_URI);
