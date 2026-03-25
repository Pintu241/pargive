import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import supabase from "./lib/supabase.js";

import authRoutes          from "./routes/auth.js";
import subscriptionRoutes  from "./routes/subscriptions.js";
import scoreRoutes         from "./routes/scores.js";
import userRoutes          from "./routes/users.js";
import drawRoutes          from "./routes/draws.js";
import donationRoutes      from "./routes/donations.js";
import adminRoutes         from "./routes/admin.js";

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── SECURITY HEADERS ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ─── STRIPE WEBHOOK — must be raw body before json() ─────────────────────────
app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" })
);

// ─── BODY PARSERS ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { message: "Too many auth attempts, please try again later." },
});

app.use("/api", limiter);
app.use("/api/auth", authLimiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/scores",        scoreRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/draws",         drawRoutes);
app.use("/api/donations",     donationRoutes);
app.use("/api/admin",         adminRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/health", async (_, res) => {
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (error) throw error;
    res.json({ status: "ok", supabase: "connected", env: process.env.NODE_ENV });
  } catch (err) {
    res.status(500).json({ status: "ok", supabase: "FAILED", error: err.message });
  }
});


// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production"
      ? "Internal server error."
      : err.message,
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ParGive API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

export default app;
