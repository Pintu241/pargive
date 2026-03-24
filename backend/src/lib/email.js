import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "noreply@pargive.com";
const BASE = process.env.FRONTEND_URL || "http://localhost:5173";

async function send(to, subject, html) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
}

const wrap = (body) => `
<div style="background:#0A0A08;color:#F0EDE6;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;">
  <div style="margin-bottom:28px;">
    <span style="font-family:Georgia,serif;font-size:22px;">Par<em style="color:#C9A84C;">Give</em></span>
  </div>
  ${body}
  <div style="margin-top:36px;padding-top:16px;border-top:1px solid rgba(201,168,76,0.15);font-size:11px;color:#9C9A8E;">
    © 2026 ParGive Ltd · <a href="${BASE}" style="color:#C9A84C;text-decoration:none;">pargive.com</a>
  </div>
</div>`;

export const emailService = {
  async welcomeEmail(user) {
    await send(
      user.email,
      "Welcome to ParGive — you're in.",
      wrap(`
        <h2 style="font-size:26px;font-weight:300;margin-bottom:12px;">Welcome, ${user.name.split(" ")[0]}.</h2>
        <p style="color:#9C9A8E;line-height:1.7;margin-bottom:20px;">Your ParGive membership is now active. Log your first Stableford score to enter this month's draw.</p>
        <a href="${BASE}/dashboard" style="display:inline-block;background:#C9A84C;color:#0A0A08;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.12em;font-weight:500;">GO TO DASHBOARD →</a>
      `)
    );
  },

  async drawResultsEmail(user, draw, matched, prize) {
    const won = prize > 0;
    await send(
      user.email,
      `ParGive ${draw.month} Draw Results`,
      wrap(`
        <h2 style="font-size:26px;font-weight:300;margin-bottom:12px;">${draw.month} Draw Results</h2>
        <p style="color:#9C9A8E;margin-bottom:16px;">The draw numbers were: <strong style="color:#F0EDE6;">${draw.numbers.join(", ")}</strong></p>
        ${won
          ? `<p style="color:#1D9E75;font-size:18px;font-weight:500;margin-bottom:12px;">🎉 Congratulations — you won £${prize.toLocaleString()}!</p>
             <p style="color:#9C9A8E;line-height:1.7;margin-bottom:20px;">You matched ${matched.length} numbers: ${matched.join(", ")}. Log in to submit your proof and claim your prize.</p>`
          : `<p style="color:#9C9A8E;line-height:1.7;margin-bottom:20px;">You matched ${matched.length} number${matched.length !== 1 ? "s" : ""} this month. Keep playing — the jackpot rolls over!</p>`
        }
        <a href="${BASE}/dashboard/draw" style="display:inline-block;background:#C9A84C;color:#0A0A08;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.12em;font-weight:500;">VIEW RESULTS →</a>
      `)
    );
  },

  async winnerApprovedEmail(user, winner) {
    await send(
      user.email,
      "ParGive — Your prize payout is approved",
      wrap(`
        <h2 style="font-size:26px;font-weight:300;margin-bottom:12px;">Payout Approved</h2>
        <p style="color:#9C9A8E;line-height:1.7;margin-bottom:20px;">Your prize of <strong style="color:#C9A84C;">£${winner.prize.toLocaleString()}</strong> for the ${winner.drawMonth} draw has been approved and will be processed within 3–5 business days.</p>
        <a href="${BASE}/dashboard/draw" style="display:inline-block;background:#C9A84C;color:#0A0A08;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.12em;font-weight:500;">VIEW DASHBOARD →</a>
      `)
    );
  },

  async subscriptionCancelledEmail(user) {
    await send(
      user.email,
      "ParGive — Subscription cancelled",
      wrap(`
        <h2 style="font-size:26px;font-weight:300;margin-bottom:12px;">Subscription Cancelled</h2>
        <p style="color:#9C9A8E;line-height:1.7;margin-bottom:20px;">Your ParGive subscription has been cancelled. You'll retain access until the end of your current billing period.</p>
        <a href="${BASE}/subscribe" style="display:inline-block;background:#C9A84C;color:#0A0A08;padding:12px 28px;text-decoration:none;font-size:12px;letter-spacing:0.12em;font-weight:500;">REACTIVATE →</a>
      `)
    );
  },
};
