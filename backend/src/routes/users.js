import { Router } from "express";
import supabase from "../lib/supabase.js";
import { authenticate, requireSubscription } from "../middleware/auth.js";

const router = Router();

// ─── GET /api/users/me/overview ───────────────────────────────────────────────
router.get("/me/overview", authenticate, requireSubscription, async (req, res) => {
  const u = req.user;

  const { data: scores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", u.id)
    .order("date", { ascending: false })
    .limit(5);

  res.json({
    renewDate:    u.renew_date,
    scoreCount:   scores?.length ?? 0,
    scores:       scores?.map(s => s.score) ?? [],
    totalWon:     u.total_won    ?? 0,
    totalDonated: u.total_donated ?? 0,
    charity:      u.charity ?? null,
    charityPct:   u.charity_pct ?? 10,
  });
});

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
router.put("/me", authenticate, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Name and email required." });

  const { data, error } = await supabase
    .from("users")
    .update({ name: name.trim(), email: email.toLowerCase().trim() })
    .eq("id", req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Failed to update profile." });
  res.json({ message: "Profile updated.", user: data });
});

// ─── PUT /api/users/me/charity ────────────────────────────────────────────────
router.put("/me/charity", authenticate, requireSubscription, async (req, res) => {
  const { charity, charityPct } = req.body;

  if (!charity) return res.status(400).json({ message: "Charity is required." });
  const pct = parseInt(charityPct);
  if (!pct || pct < 10 || pct > 50) {
    return res.status(400).json({ message: "Charity percentage must be between 10 and 50." });
  }

  const { error } = await supabase
    .from("users")
    .update({ charity, charity_pct: pct })
    .eq("id", req.user.id);

  if (error) return res.status(500).json({ message: "Failed to update charity settings." });
  res.json({ message: "Charity settings saved." });
});

export default router;
