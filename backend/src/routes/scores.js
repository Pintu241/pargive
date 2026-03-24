import { Router } from "express";
import supabase from "../lib/supabase.js";
import { authenticate, requireSubscription } from "../middleware/auth.js";

const router = Router();

// ─── GET /api/scores ──────────────────────────────────────────────────────────
// Returns the user's current 5 scores (most recent first)
router.get("/", authenticate, requireSubscription, async (req, res) => {
  const { data, error } = await supabase
    .from("scores")
    .select("id, score, date, course, created_at")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false })
    .limit(5);

  if (error) return res.status(500).json({ message: "Failed to fetch scores." });
  res.json(data);
});

// ─── POST /api/scores ─────────────────────────────────────────────────────────
// Adds a new score; enforces 1–45 range; removes oldest if >5 stored
router.post("/", authenticate, requireSubscription, async (req, res) => {
  const { score, date, course } = req.body;
  const s = parseInt(score);

  if (!s || s < 1 || s > 45) {
    return res.status(400).json({ message: "Score must be between 1 and 45 (Stableford)." });
  }
  if (!date) {
    return res.status(400).json({ message: "Date is required." });
  }

  // Fetch existing scores sorted oldest-first
  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", req.user.id)
    .order("date", { ascending: true });

  // If already 5 scores, delete the oldest
  if (existing && existing.length >= 5) {
    await supabase.from("scores").delete().eq("id", existing[0].id);
  }

  // Insert new score
  await supabase.from("scores").insert({
    user_id: req.user.id,
    score:   s,
    date,
    course:  course?.trim() || null,
  });

  // Return updated list (most recent first)
  const { data: updated } = await supabase
    .from("scores")
    .select("id, score, date, course, created_at")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false })
    .limit(5);

  res.json(updated);
});

// ─── DELETE /api/scores/:id ───────────────────────────────────────────────────
router.delete("/:id", authenticate, requireSubscription, async (req, res) => {
  // Verify ownership
  const { data: score } = await supabase
    .from("scores")
    .select("user_id")
    .eq("id", req.params.id)
    .single();

  if (!score || score.user_id !== req.user.id) {
    return res.status(404).json({ message: "Score not found." });
  }

  await supabase.from("scores").delete().eq("id", req.params.id);

  const { data: updated } = await supabase
    .from("scores")
    .select("id, score, date, course, created_at")
    .eq("user_id", req.user.id)
    .order("date", { ascending: false })
    .limit(5);

  res.json(updated);
});

export default router;
