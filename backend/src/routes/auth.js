import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../lib/supabase.js";
import { authenticate } from "../middleware/auth.js";
import { emailService } from "../lib/email.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(u) {
  return {
    id:                 u.id,
    name:               u.name,
    email:              u.email,
    role:               u.role,
    plan:               u.plan,
    subscriptionActive: u.subscription_active,
    subscriptionStatus: u.subscription_status,
    renewDate:          u.renew_date,
    charity:            u.charity,
    charityPct:         u.charity_pct,
    totalDonated:       u.total_donated,
    totalWon:           u.total_won,
  };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name,
      email:               email.toLowerCase(),
      password_hash:       passwordHash,
      role:                "member",
      subscription_active: false,
      subscription_status: "inactive",
      charity_pct:         10,
      total_donated:       0,
      total_won:           0,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create account." });
  }

  await emailService.welcomeEmail(user).catch(console.error);

  res.status(201).json({ token: signToken(user.id), user: sanitizeUser(user) });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: signToken(user.id), user: sanitizeUser(user) });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
router.put("/password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }

  const { data: user } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", req.user.id)
    .single();

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await supabase.from("users").update({ password_hash: newHash }).eq("id", req.user.id);

  res.json({ message: "Password updated." });
});

export default router;
