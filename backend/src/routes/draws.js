import { Router } from "express";
import supabase from "../lib/supabase.js";
import { authenticate, requireSubscription } from "../middleware/auth.js";

const router = Router();

// ─── GET /api/draws/my-history ────────────────────────────────────────────────
// Returns the user's participation record for each published draw
router.get("/my-history", authenticate, requireSubscription, async (req, res) => {
  // Get all published draws (most recent first)
  const { data: draws, error: drawsErr } = await supabase
    .from("draws")
    .select("id, month, status, numbers, jackpot, pool4, pool3")
    .order("created_at", { ascending: false });

  if (drawsErr) return res.status(500).json({ message: "Failed to fetch draws." });

  // Get user's scores from each draw period via draw_entries
  const { data: entries } = await supabase
    .from("draw_entries")
    .select("draw_id, matched_numbers, tier, prize_amount")
    .eq("user_id", req.user.id);

  const entryMap = {};
  (entries || []).forEach(e => { entryMap[e.draw_id] = e; });

  const result = draws.map(d => {
    const entry = entryMap[d.id];
    return {
      month:   d.month,
      status:  d.status,
      numbers: d.numbers,
      matched: entry?.matched_numbers ?? [],
      tier:    entry?.tier ?? null,
      prize:   entry?.prize_amount ?? 0,
    };
  });

  res.json(result);
});

export default router;
