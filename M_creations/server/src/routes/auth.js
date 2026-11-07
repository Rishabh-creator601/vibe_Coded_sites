import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { HttpError } from '../middleware/errors.js';
import { clearSession, requireAuth, setSession } from '../middleware/auth.js';

export const authRoutes = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(200);

/** Stores +91XXXXXXXXXX for Indian mobiles, however they were typed. Other countries need their + code. */
function normalizePhone(text) {
  const value = text.replace(/[\s().-]/g, '');
  const indian = value.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (indian) return `+91${indian[1]}`;
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
}

const phone = z
  .string({ required_error: 'Enter your phone number' })
  .max(24, 'Enter a valid phone number, like 98765 43210')
  .transform((text, ctx) => {
    const normalized = normalizePhone(text);
    if (normalized) return normalized;
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid phone number, like 98765 43210' });
    return z.NEVER;
  });

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  email,
  phone,
  // bcrypt only reads the first 72 bytes.
  password: z.string().min(8, 'Use at least 8 characters').max(72),
});

const loginSchema = z.object({ email, password: z.string().min(1).max(200) });

authRoutes.post('/register', limiter, async (req, res) => {
  const body = registerSchema.parse(req.body);
  if (await User.exists({ email: body.email })) {
    throw new HttpError(409, 'An account with this email already exists. Log in instead.');
  }
  const user = await User.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: await bcrypt.hash(body.password, 12),
  });
  setSession(res, user);
  res.status(201).json({ user: user.toPublic() });
});

authRoutes.post('/login', limiter, async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await User.findOne({ email: body.email });
  const ok = user?.passwordHash && (await bcrypt.compare(body.password, user.passwordHash));
  if (!ok) {
    throw new HttpError(401, 'Email or password is incorrect. If you signed up with Google, use the Google button.');
  }
  setSession(res, user);
  res.json({ user: user.toPublic() });
});

authRoutes.post('/google', limiter, async (req, res) => {
  if (!config.googleClientId) throw new HttpError(503, 'Google login is not set up yet.');
  const { credential } = z.object({ credential: z.string().min(1).max(4096) }).parse(req.body);

  let payload;
  try {
    const ticket = await new OAuth2Client(config.googleClientId).verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'Google could not confirm this login. Try again.');
  }
  if (!payload?.email || !payload.email_verified) {
    throw new HttpError(401, 'This Google account has no verified email address.');
  }

  const address = payload.email.toLowerCase();
  let user = await User.findOne({ email: address });
  if (!user) {
    user = await User.create({ name: payload.name || address, email: address, googleId: payload.sub });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    // Sign-up doesn't verify email, so someone else may have registered this
    // address first. Google has now proved who owns it, so drop that password
    // and the phone number that came with it.
    if (user.role !== 'admin') {
      user.passwordHash = null;
      user.phone = null;
    }
    await user.save();
  }
  setSession(res, user);
  res.json({ user: user.toPublic() });
});

authRoutes.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRoutes.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

authRoutes.patch('/me', requireAuth, async (req, res) => {
  const body = z.object({ phone }).parse(req.body);
  req.user.phone = body.phone;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});
