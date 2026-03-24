import { Router } from "express";
import supabase from "../lib/supabase.js";
import { authenticate, requireSubscription } from "../middleware/auth.js";

const router = Router();

// ─── POST /api/donations/one-off ──────────────────────────────────────────────
router.post("/one-off", authenticate, requireSubscription, async (req, res) => {
  const { amount, charity } = req.body;
  const amt = parseFloat(amount);

  if (!amt || amt <= 0) return res.status(400).json({ message: "Amount must be a positive number." });
  if (!charity)         return res.status(400).json({ message: "Charity is required." });

  // Record the donation
  const { error } = await supabase.from("donations").insert({
    user_id:    req.user.id,
    charity,
    amount:     Math.round(amt * 100), // store in pence
    type:       "one_off",
    created_at: new Date().toISOString(),
  });

  if (error) return res.status(500).json({ message: "Failed to record donation." });

  // Update user's total_donated
  await supabase.rpc("increment_total_donated", {
    p_user_id: req.user.id,
    p_amount:  Math.round(amt * 100),
  });

  res.json({ message: `Donation of £${amt.toFixed(2)} to ${charity} recorded.` });
});

export default router;
