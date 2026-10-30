import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User, { publicUser } from "../models/User.js";
import { clearAuthCookie, requireAuth, setAuthCookie } from "../middleware/auth.js";
import { loginLimiter, validate } from "../middleware/common.js";
import { AppError, asyncHandler } from "../utils/http.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be 2-40 characters").max(40, "Name must be 2-40 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be 8-72 characters").max(72, "Password must be 8-72 characters"),
});
const loginSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email"), password: z.string().min(1, "Password is required") });

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.exists({ email })) throw new AppError(400, "VALIDATION_ERROR", "That email is already registered");
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
    setAuthCookie(res, user.id);
    res.status(201).json({ user: publicUser(user) });
  }),
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      throw new AppError(401, "UNAUTHORIZED", "Wrong email or password");
    }
    setAuthCookie(res, user.id);
    res.json({ user: publicUser(user) });
  }),
);

router.post("/logout", requireAuth, (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
