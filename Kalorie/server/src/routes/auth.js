import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { calculateTargetCalories, calculateMacroTargets } from '../utils/calories.js';

const router = Router();

// Recompute the calorie + macro goals from a user's current profile.
function applyTargets(user) {
  user.targetCalories = calculateTargetCalories({
    gender: user.gender,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    age: user.age,
    activityLevel: user.activityLevel,
  });
  const { proteinTarget, carbsTarget } = calculateMacroTargets(user.targetCalories, user.dietType);
  user.proteinTarget = proteinTarget;
  user.carbsTarget = carbsTarget;
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// POST /api/auth/register — create account + compute calorie/macro targets
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      age,
      heightCm,
      weightKg,
      dietType,
      activityLevel,
      country,
    } = req.body;

    if (!name || !email || !password || !gender || !age || !heightCm || !weightKg || !dietType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash,
      gender,
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      dietType,
      activityLevel: activityLevel || 'sedentary',
      country: country || 'India',
      targetCalories: 0,
      proteinTarget: 0,
      carbsTarget: 0,
    });
    applyTargets(user);
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Could not create account' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Could not log in' });
  }
});

// GET /api/auth/me — current user (used to refresh client state)
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: user.toSafeJSON() });
});

// PATCH /api/auth/me — update profile (settings) + recompute targets
router.patch('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const editable = [
      'name',
      'gender',
      'age',
      'heightCm',
      'weightKg',
      'dietType',
      'activityLevel',
      'country',
      'profilePicture',
    ];
    const numeric = new Set(['age', 'heightCm', 'weightKg']);

    for (const key of editable) {
      if (key in req.body && req.body[key] !== '') {
        user[key] = numeric.has(key) ? Number(req.body[key]) : req.body[key];
      }
    }

    applyTargets(user);
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error('update profile error', err);
    res.status(500).json({ error: 'Could not update profile' });
  }
});

export default router;
