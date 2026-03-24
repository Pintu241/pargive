import jwt from "jsonwebtoken";
import supabase from "../lib/supabase.js";

// ─── VERIFY JWT ───────────────────────────────────────────────────────────────
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Re-fetch user on every request to get fresh subscription status
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, plan, subscription_active, subscription_status, renew_date, charity, charity_pct, total_donated, total_won")
      .eq("id", payload.userId)
      .single();

    if (error || !user) return res.status(401).json({ message: "User not found." });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ─── REQUIRE ACTIVE SUBSCRIPTION ─────────────────────────────────────────────
export function requireSubscription(req, res, next) {
  if (!req.user.subscription_active) {
    return res.status(403).json({ message: "Active subscription required." });
  }
  next();
}

// ─── REQUIRE ADMIN ROLE ───────────────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}
