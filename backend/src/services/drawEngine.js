import supabase from "../lib/supabase.js";
import { emailService } from "../lib/email.js";

// ─── POOL SPLIT CONSTANTS (PRD §07) ──────────────────────────────────────────
const POOL_SPLITS = {
  5: 0.40,  // Jackpot — rolls over if unclaimed
  4: 0.35,
  3: 0.25,
};

// ─── GENERATE DRAW NUMBERS ────────────────────────────────────────────────────
export async function generateDrawNumbers(mode = "random") {
  if (mode === "random") {
    // Standard lottery-style: 5 unique numbers from 1–45
    const picked = new Set();
    while (picked.size < 5) {
      picked.add(Math.floor(Math.random() * 45) + 1);
    }
    return [...picked];
  }

  // Algorithmic: weighted toward most-frequent user scores
  const { data: scores } = await supabase
    .from("scores")
    .select("score");

  const freq = {};
  (scores || []).forEach(({ score }) => {
    freq[score] = (freq[score] || 0) + 1;
  });

  // Top 10 most-frequent scores get extra weight in the pool
  const top10 = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([s]) => Number(s));

  // Build weighted pool: top scores appear 3× more often
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const weight = top10.includes(i) ? 3 : 1;
    for (let w = 0; w < weight; w++) pool.push(i);
  }

  const picked = new Set();
  while (picked.size < 5) {
    picked.add(pool[Math.floor(Math.random() * pool.length)]);
  }
  return [...picked];
}

// ─── CALCULATE PRIZE POOLS ────────────────────────────────────────────────────
export function calculatePools(totalPool, jackpotCarryover = 0) {
  return {
    pool5: Math.round(totalPool * POOL_SPLITS[5]) + jackpotCarryover,
    pool4: Math.round(totalPool * POOL_SPLITS[4]),
    pool3: Math.round(totalPool * POOL_SPLITS[3]),
  };
}

// ─── MATCH NUMBERS ────────────────────────────────────────────────────────────
function matchNumbers(userScores, drawNumbers) {
  return userScores.filter(s => drawNumbers.includes(s));
}

// ─── PUBLISH DRAW ─────────────────────────────────────────────────────────────
// Called by admin after simulation; identifies winners, splits prizes, updates DB
export async function publishDraw(drawId, numbers) {
  // 1. Mark draw as published
  const { data: draw } = await supabase
    .from("draws")
    .update({ status: "published", numbers, published_at: new Date().toISOString() })
    .eq("id", drawId)
    .select()
    .single();

  if (!draw) throw new Error("Draw not found.");

  // 2. Get all active subscribers with their latest 5 scores
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("subscription_active", true);

  const results = { winners5: [], winners4: [], winners3: [] };

  for (const user of users || []) {
    const { data: scoreRows } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5);

    const userScores  = (scoreRows || []).map(r => r.score);
    const matched     = matchNumbers(userScores, numbers);
    const matchCount  = matched.length;

    let tier  = null;
    let prize = 0;

    if (matchCount >= 3) {
      tier = `${matchCount}-match`;
      if (matchCount === 5) results.winners5.push({ user, matched });
      else if (matchCount === 4) results.winners4.push({ user, matched });
      else results.winners3.push({ user, matched });
    }

    // Record draw entry regardless of win/loss
    await supabase.from("draw_entries").upsert({
      user_id:          user.id,
      draw_id:          drawId,
      scores_entered:   userScores,
      matched_numbers:  matched,
      tier,
      prize_amount:     prize,
    }, { onConflict: "user_id,draw_id" });
  }

  // 3. Calculate prizes
  const pools = calculatePools(draw.pool_total || 0, draw.jackpot_carryover || 0);

  // 5-match: split jackpot equally; rollover if no winners
  let jackpotRollover = 0;
  if (results.winners5.length > 0) {
    const share = Math.round(pools.pool5 / results.winners5.length);
    for (const w of results.winners5) {
      await createWinner(w.user, draw, "5-match", share, w.matched);
    }
  } else {
    jackpotRollover = pools.pool5; // Carry forward to next draw
  }

  // 4-match
  if (results.winners4.length > 0) {
    const share = Math.round(pools.pool4 / results.winners4.length);
    for (const w of results.winners4) await createWinner(w.user, draw, "4-match", share, w.matched);
  }

  // 3-match
  if (results.winners3.length > 0) {
    const share = Math.round(pools.pool3 / results.winners3.length);
    for (const w of results.winners3) await createWinner(w.user, draw, "3-match", share, w.matched);
  }

  // 4. Update jackpot carryover for next draw
  if (jackpotRollover > 0) {
    await supabase.from("draws").update({ jackpot_carryover: jackpotRollover })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);
  }

  // 5. Send results emails to all participants
  for (const user of users || []) {
    const { data: entry } = await supabase
      .from("draw_entries")
      .select("matched_numbers, prize_amount")
      .eq("user_id", user.id)
      .eq("draw_id", drawId)
      .single();

    await emailService
      .drawResultsEmail(user, draw, entry?.matched_numbers || [], entry?.prize_amount || 0)
      .catch(console.error);
  }

  return {
    winners5: results.winners5.length,
    winners4: results.winners4.length,
    winners3: results.winners3.length,
    jackpotRollover,
  };
}

async function createWinner(user, draw, tier, prize, matched) {
  // Insert into winners table (status: "review" — awaiting proof upload)
  await supabase.from("winners").insert({
    user_id:      user.id,
    draw_id:      draw.id,
    draw_month:   draw.month,
    tier,
    prize,
    status:       "review",
    submitted_at: null,
    proof_url:    null,
  });

  // Update draw_entry with prize
  await supabase.from("draw_entries")
    .update({ prize_amount: prize })
    .eq("user_id", user.id)
    .eq("draw_id", draw.id);

  // Update user total_won
  await supabase.rpc("increment_total_won", {
    p_user_id: user.id,
    p_amount:  prize,
  });
}
