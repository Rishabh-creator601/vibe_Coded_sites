import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me')) {
  throw new Error('Set JWT_SECRET to a long random value before running in production.');
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 5100,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/m_creations',
  jwtSecret: process.env.JWT_SECRET || 'local-development-only',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
