import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';
import { HttpError } from './errors.js';

const COOKIE = 'mc_session';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.isProd,
  path: '/',
};

export function setSession(res, user) {
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d' });
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: WEEK_MS });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, cookieOptions);
}

export async function requireAuth(req, _res, next) {
  try {
    const { sub } = jwt.verify(req.cookies?.[COOKIE] ?? '', config.jwtSecret);
    // Load the user each time so a removed account or changed role applies at once.
    const user = await User.findById(sub);
    if (!user) throw new Error('missing user');
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, 'Log in to continue.'));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Only the shop owner can do this.'));
  next();
}
