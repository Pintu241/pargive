import { Router } from "express";
import multer from "multer";
import supabase from "../lib/supabase.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { generateDrawNumbers, publishDraw } from "../services/drawEngine.js";

const router = Router();
router.use(authenticate, requireAdmin);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── GET /api/admin/overview ──────────────────────────────────────────────────
router.get("/overview", async (req, res) => {
  const { data: users }    = await supabase.from("users").select("id, status:subscription_status");
  const { data: draws }    = await supabase.from("draws").select("*").order("created_at", { ascending: false }).limit(1);
  const { data: winners }  = await supabase.from("winners").select("id, status");
  const { data: donations } = await supabase.from("donations").select("amount");
  const { data: recent }   = await supabase.from("users").select("id, name, email, plan, subscription_status").order("created_at", { ascending: false }).limit(5);

  const totalUsers  = users?.length ?? 0;
  const activeUsers = users?.filter(u => u.status === "active").length ?? 0;
  const latestDraw  = draws?.[0];
  const totalPool   = latestDraw ? (latestDraw.jackpot + latestDraw.pool4 + latestDraw.pool3) : 0;
  const totalDonated = (donations || []).reduce((a, d) => a + d.amount, 0);
  const pendingWinners = (winners || []).filter(w => w.status === "review" || w.status === "pending").length;

  const daysUntilDraw = latestDraw?.draw_date
    ? Math.max(0, Math.ceil((new Date(latestDraw.draw_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  res.json({
    totalUsers,
    activeUsers,
    currentPool:    `£${(totalPool / 100).toLocaleString()}`,
    totalDonated:   `£${(totalDonated / 100).toLocaleString()}`,
    daysUntilDraw:  daysUntilDraw ?? "—",
    nextDrawMonth:  latestDraw?.month ?? "—",
    nextDrawDate:   latestDraw?.draw_date ?? "—",
    pendingWinners,
    recentUsers:    (recent || []).map(u => ({ ...u, status: u.subscription_status })),
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, plan, subscription_status, charity_pct, charity, total_donated, total_won, created_at")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Failed to fetch users." });

  const withScores = await Promise.all((data || []).map(async u => {
    const { data: scores } = await supabase.from("scores").select("score").eq("user_id", u.id).order("date", { ascending: false }).limit(5);
    return {
      id:           u.id,
      name:         u.name,
      email:        u.email,
      plan:         u.plan,
      status:       u.subscription_status,
      charityPct:   u.charity_pct,
      charity:      u.charity,
      totalDonated: u.total_donated,
      totalWon:     u.total_won,
      scores:       (scores || []).map(s => s.score),
    };
  }));

  res.json(withScores);
});

router.patch("/users/:id", async (req, res) => {
  const allowed = ["name", "email", "plan", "charity_pct", "subscription_status"];
  const updates = {};
  Object.keys(req.body).forEach(k => { if (allowed.includes(k) || k === "charityPct") updates[k === "charityPct" ? "charity_pct" : k] = req.body[k]; });

  // Handle score updates separately
  if (req.body.scores) {
    await supabase.from("scores").delete().eq("user_id", req.params.id);
    const scoreRows = req.body.scores.map((s, i) => ({
      user_id: req.params.id,
      score:   s,
      date:    new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
    }));
    if (scoreRows.length) await supabase.from("scores").insert(scoreRows);
  }

  if (Object.keys(updates).length) {
    await supabase.from("users").update(updates).eq("id", req.params.id);
  }

  const { data } = await supabase.from("users").select("id,name,email,plan,subscription_status,charity_pct,charity,total_donated,total_won").eq("id", req.params.id).single();
  res.json({ ...data, status: data.subscription_status, charityPct: data.charity_pct, totalDonated: data.total_donated, totalWon: data.total_won });
});

// ─── DRAWS ────────────────────────────────────────────────────────────────────
router.get("/draws", async (req, res) => {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Failed to fetch draws." });

  res.json((data || []).map(d => ({
    id:       d.id,
    month:    d.month,
    status:   d.status,
    numbers:  d.numbers,
    jackpot:  d.jackpot,
    pool4:    d.pool4,
    pool3:    d.pool3,
    winners5: d.winners5 ?? 0,
    winners4: d.winners4 ?? 0,
    winners3: d.winners3 ?? 0,
  })));
});

router.post("/draws/simulate", async (req, res) => {
  const { mode = "random" } = req.body;
  try {
    const numbers = await generateDrawNumbers(mode);
    res.json({ numbers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Simulation failed." });
  }
});

router.post("/draws/publish", async (req, res) => {
  const { numbers, mode } = req.body;
  if (!numbers || numbers.length !== 5) {
    return res.status(400).json({ message: "Exactly 5 draw numbers required." });
  }

  // Get the pending draw
  const { data: pending } = await supabase
    .from("draws")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pending) return res.status(400).json({ message: "No pending draw to publish." });

  try {
    const summary = await publishDraw(pending.id, numbers);
    res.json({ message: "Draw published.", ...summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to publish draw." });
  }
});

// ─── CHARITIES ────────────────────────────────────────────────────────────────
router.get("/charities", async (req, res) => {
  const { data, error } = await supabase.from("charities").select("*").order("name");
  if (error) return res.status(500).json({ message: "Failed to fetch charities." });
  res.json(data || []);
});

router.post("/charities", async (req, res) => {
  const { name, category, description } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Charity name is required." });

  const { data, error } = await supabase
    .from("charities")
    .insert({ name: name.trim(), category: category?.trim() || null, description: description?.trim() || null, active: true, total_received: 0, subscribers: 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Failed to create charity." });
  res.status(201).json(data);
});

router.patch("/charities/:id", async (req, res) => {
  const { name, category, description } = req.body;
  const { data, error } = await supabase
    .from("charities")
    .update({ name, category, description })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Failed to update charity." });
  res.json(data);
});

router.patch("/charities/:id/toggle", async (req, res) => {
  const { data: current } = await supabase.from("charities").select("active").eq("id", req.params.id).single();
  const { data, error } = await supabase.from("charities").update({ active: !current.active }).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ message: "Failed." });
  res.json(data);
});

router.delete("/charities/:id", async (req, res) => {
  await supabase.from("charities").delete().eq("id", req.params.id);
  res.json({ message: "Charity deleted." });
});

// ─── WINNERS ──────────────────────────────────────────────────────────────────
router.get("/winners", async (req, res) => {
  const { data, error } = await supabase
    .from("winners")
    .select("id, user_id, draw_month, tier, prize, status, proof_url, submitted_at, users(name, email)")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Failed to fetch winners." });

  res.json((data || []).map(w => ({
    id:          w.id,
    userId:      w.user_id,
    userName:    w.users?.name,
    userEmail:   w.users?.email,
    drawMonth:   w.draw_month,
    tier:        w.tier,
    prize:       w.prize,
    status:      w.status,
    proofUrl:    w.proof_url,
    submittedAt: w.submitted_at,
  })));
});

router.patch("/winners/:id", async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "paid", "rejected"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status." });

  const { data, error } = await supabase
    .from("winners")
    .update({ status })
    .eq("id", req.params.id)
    .select("*, users(name, email)")
    .single();

  if (error) return res.status(500).json({ message: "Failed to update winner." });

  res.json({
    id:        data.id,
    userName:  data.users?.name,
    drawMonth: data.draw_month,
    tier:      data.tier,
    prize:     data.prize,
    status:    data.status,
    proofUrl:  data.proof_url,
    submittedAt: data.submitted_at,
  });
});

// ─── REPORTS ──────────────────────────────────────────────────────────────────
router.get("/reports", async (req, res) => {
  const [{ data: users }, { data: draws }, { data: winners }, { data: donations }, { data: charities }] = await Promise.all([
    supabase.from("users").select("id, subscription_status, total_won"),
    supabase.from("draws").select("*").eq("status", "published"),
    supabase.from("winners").select("tier, prize, status"),
    supabase.from("donations").select("amount"),
    supabase.from("charities").select("name, total_received").eq("active", true),
  ]);

  const totalUsers     = users?.length ?? 0;
  const activeUsers    = users?.filter(u => u.subscription_status === "active").length ?? 0;
  const lapsedUsers    = users?.filter(u => u.subscription_status === "lapsed").length ?? 0;
  const cancelledUsers = users?.filter(u => u.subscription_status === "cancelled").length ?? 0;
  const totalDonated   = (donations || []).reduce((a, d) => a + d.amount, 0) / 100;
  const totalPool      = (draws || []).reduce((a, d) => a + (d.jackpot || 0) + (d.pool4 || 0) + (d.pool3 || 0), 0);
  const totalPaidOut   = (winners || []).filter(w => w.status === "paid").reduce((a, w) => a + w.prize, 0);
  const latestDraw     = draws?.[draws.length - 1];

  res.json({
    totalUsers,
    activeUsers,
    lapsedUsers,
    cancelledUsers,
    totalDonated,
    totalPool:       totalPool / 100,
    totalPaidOut:    totalPaidOut / 100,
    drawsRun:        draws?.length ?? 0,
    winners5:        (winners || []).filter(w => w.tier === "5-match").length,
    winners4:        (winners || []).filter(w => w.tier === "4-match").length,
    winners3:        (winners || []).filter(w => w.tier === "3-match").length,
    currentJackpot:  latestDraw?.jackpot ? latestDraw.jackpot / 100 : 0,
    charityBreakdown: (charities || []).map(c => ({ name: c.name, totalReceived: c.total_received / 100 })),
  });
});

export default router;
