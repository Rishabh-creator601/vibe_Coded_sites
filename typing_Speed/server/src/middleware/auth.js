import jwt from "jsonwebtoken";
import { config } from "../config.js";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../utils/http.js";

export const signToken = (userId) => jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const setAuthCookie = (res, userId) =>
  res.cookie("token", signToken(userId), {
    httpOnly: true,
    sameSite: config.isProd ? "none" : "lax",
    secure: config.isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

export const clearAuthCookie = (res) =>
  res.clearCookie("token", { httpOnly: true, sameSite: config.isProd ? "none" : "lax", secure: config.isProd });

async function loadUser(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const { sub } = jwt.verify(token, config.jwtSecret);
    return await User.findById(sub);
  } catch {
    return null;
  }
}

/** Sets req.user or fails with 401. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  req.user = await loadUser(req);
  if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Please log in");
  next();
});

/** Sets req.user when logged in; guests pass through. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await loadUser(req);
  next();
});
