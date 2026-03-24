import { Router } from "express";
import stripe from "../lib/stripe.js";
import supabase from "../lib/supabase.js";
import { authenticate } from "../middleware/auth.js";
import { emailService } from "../lib/email.js";

const router = Router();

// Plan price map — in production use Stripe Price IDs from your dashboard
const PRICE_MAP = {
  contender_monthly: { amount: 999,   interval: "month" },
  contender_annual:  { amount: 9900,  interval: "year"  },
  champion_monthly:  { amount: 2099,  interval: "month" },
  champion_annual:   { amount: 19900, interval: "year"  },
};

const PLAN_LABELS = {
  contender_monthly: "Contender",
  contender_annual:  "Contender",
  champion_monthly:  "Champion",
  champion_annual:   "Champion",
};

// ─── POST /api/subscriptions/create ──────────────────────────────────────────
// In production: receive paymentMethodId from Stripe.js on the frontend.
// For now accepts planKey + yearly to create/update the subscription.
router.post("/create", authenticate, async (req, res) => {
  const { planKey, yearly, charity, charityPct, paymentMethodId } = req.body;

  if (!planKey) return res.status(400).json({ message: "planKey is required." });

  const priceKey = `${planKey}_${yearly ? "annual" : "monthly"}`;
  const priceInfo = PRICE_MAP[priceKey];
  if (!priceInfo) return res.status(400).json({ message: "Invalid plan." });

  try {
    let stripeCustomerId = req.user.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name:  req.user.name,
        metadata: { userId: req.user.id },
      });
      stripeCustomerId = customer.id;
    }

    // In a real flow: attach paymentMethodId to customer, then create subscription.
    // Here we simulate a successful subscription for demo purposes.
    const now       = new Date();
    const renewDate = new Date(now);
    renewDate.setMonth(renewDate.getMonth() + (yearly ? 12 : 1));

    const charityContribution = Math.round(priceInfo.amount * (charityPct || 10) / 100);

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        stripe_customer_id:  stripeCustomerId,
        plan:                PLAN_LABELS[priceKey],
        subscription_active: true,
        subscription_status: "active",
        renew_date:          renewDate.toISOString().split("T")[0],
        charity:             charity || req.user.charity,
        charity_pct:         charityPct || 10,
        subscribed_at:       now.toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    // Log the subscription in subscriptions table
    await supabase.from("subscriptions").insert({
      user_id:    req.user.id,
      plan:       PLAN_LABELS[priceKey],
      amount:     priceInfo.amount,
      interval:   priceInfo.interval,
      status:     "active",
      started_at: now.toISOString(),
      renew_date: renewDate.toISOString().split("T")[0],
    });

    res.json({ message: "Subscription created.", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create subscription." });
  }
});

// ─── POST /api/subscriptions/cancel ──────────────────────────────────────────
router.post("/cancel", authenticate, async (req, res) => {
  try {
    await supabase
      .from("users")
      .update({ subscription_status: "cancelled" })
      .eq("id", req.user.id);

    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("user_id", req.user.id)
      .eq("status", "active");

    await emailService.subscriptionCancelledEmail(req.user).catch(console.error);

    res.json({ message: "Subscription cancelled. Access continues until end of billing period." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});

// ─── POST /api/subscriptions/webhook ─────────────────────────────────────────
// Stripe webhooks — handle renewal, payment failure, lapse
router.post("/webhook", async (req, res) => {
  const sig    = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ message: "Webhook signature invalid." });
  }

  switch (event.type) {
    case "invoice.paid": {
      const invoice    = event.data.object;
      const customerId = invoice.customer;
      const { data: user } = await supabase.from("users").select("id,renew_date").eq("stripe_customer_id", customerId).single();
      if (user) {
        const next = new Date(user.renew_date);
        next.setMonth(next.getMonth() + 1);
        await supabase.from("users").update({
          subscription_active: true,
          subscription_status: "active",
          renew_date: next.toISOString().split("T")[0],
        }).eq("id", user.id);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice    = event.data.object;
      const customerId = invoice.customer;
      await supabase.from("users").update({ subscription_status: "lapsed", subscription_active: false }).eq("stripe_customer_id", customerId);
      break;
    }
  }

  res.json({ received: true });
});

export default router;
