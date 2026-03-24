import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes          from "../backend/src/routes/auth.js";
import subscriptionRoutes  from "../backend/src/routes/subscriptions.js";
import scoreRoutes         from "../backend/src/routes/scores.js";
import userRoutes          from "../backend/src/routes/users.js";
import drawRoutes          from "../backend/src/routes/draws.js";
import donationRoutes      from "../backend/src/routes/donations.js";
import adminRoutes         from "../backend/src/routes/admin.js";

const app = express();

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

app.use(limiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/users", userRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// For Vercel serverless functions
export default (req, res) => {
  return app(req, res);
};