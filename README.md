# ParGive — Golf Charity Subscription Platform

Full-stack web application built to the Digital Heroes PRD specification.

## Project Structure

```
pargive/
├── frontend/          React + Vite SPA
│   ├── src/
│   │   ├── App.jsx              Router + auth guards
│   │   ├── main.jsx             Entry point
│   │   ├── index.css            Global styles + design tokens
│   │   ├── context/
│   │   │   └── AuthContext.jsx  JWT auth state (login/register/logout)
│   │   ├── lib/
│   │   │   └── api.js           Axios client with auth interceptor
│   │   ├── components/
│   │   │   ├── ui.jsx           Shared UI (buttons, cards, modals, etc.)
│   │   │   └── Nav.jsx          Responsive navigation bar
│   │   └── pages/
│   │       ├── HomePage.jsx     Public marketing page
│   │       ├── LoginPage.jsx    Login + Register
│   │       ├── PaymentPage.jsx  Plan picker → Charity → Card payment → Success
│   │       ├── DashboardPage.jsx  Member dashboard (Overview/Scores/Draw/Charity/Account)
│   │       └── AdminPage.jsx    Admin panel (Overview/Users/Draw/Charities/Winners/Reports)
│
└── backend/           Node.js + Express API
    ├── schema.sql               Supabase database schema + seed data
    ├── src/
    │   ├── index.js             Express server + middleware
    │   ├── lib/
    │   │   ├── supabase.js      Supabase service-role client
    │   │   ├── stripe.js        Stripe client
    │   │   └── email.js         Nodemailer transactional emails
    │   ├── middleware/
    │   │   └── auth.js          JWT verify + subscription guard + admin guard
    │   ├── services/
    │   │   └── drawEngine.js    Draw number generation + prize calculation + publish
    │   └── routes/
    │       ├── auth.js          POST /register /login  GET /me  PUT /password
    │       ├── subscriptions.js POST /create /cancel   POST /webhook
    │       ├── scores.js        GET / POST /  DELETE /:id
    │       ├── users.js         GET /me/overview  PUT /me  PUT /me/charity
    │       ├── draws.js         GET /my-history
    │       ├── donations.js     POST /one-off
    │       └── admin.js         All /admin/* endpoints
```

---

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run the full contents of `backend/schema.sql`
3. Copy your **Project URL** and **service_role key** from Project Settings → API

### 2. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Copy your **Secret Key** from Dashboard → Developers → API Keys
3. Set up a webhook endpoint pointing to `https://yourdomain.com/api/subscriptions/webhook`
   - Events to listen for: `invoice.paid`, `invoice.payment_failed`
4. Copy the **Webhook Signing Secret**

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
```

The API will run at `http://localhost:3001`.

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
# Set VITE_STRIPE_PUBLISHABLE_KEY and VITE_API_URL
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default 3001) |
| `JWT_SECRET` | Long random string for signing tokens |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (never expose to frontend) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SMTP_HOST` | SMTP server (e.g. `smtp.sendgrid.net`) |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / API key |
| `EMAIL_FROM` | Sender address |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

---

## Deployment (Vercel + Supabase)

### Frontend → Vercel
1. Push `frontend/` to a new GitHub repo
2. Import into a **new** Vercel account
3. Set environment variables in Vercel dashboard
4. Deploy — Vite builds automatically

### Backend → Vercel (Serverless) or Railway
- For Vercel: add a `vercel.json` routing all requests to `src/index.js`
- For Railway: connect repo, set env vars, deploy directly
- Ensure `FRONTEND_URL` matches your deployed frontend domain for CORS

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/password` | JWT | Change password |
| POST | `/api/subscriptions/create` | JWT | Create subscription |
| POST | `/api/subscriptions/cancel` | JWT | Cancel subscription |
| POST | `/api/subscriptions/webhook` | Stripe sig | Stripe events |
| GET | `/api/scores` | JWT + sub | Get user scores |
| POST | `/api/scores` | JWT + sub | Add score |
| DELETE | `/api/scores/:id` | JWT + sub | Delete score |
| GET | `/api/users/me/overview` | JWT + sub | Dashboard summary |
| PUT | `/api/users/me` | JWT | Update profile |
| PUT | `/api/users/me/charity` | JWT + sub | Update charity |
| GET | `/api/draws/my-history` | JWT + sub | Draw history |
| POST | `/api/donations/one-off` | JWT + sub | One-off donation |
| GET | `/api/admin/overview` | JWT + admin | Admin stats |
| GET/PATCH | `/api/admin/users` | JWT + admin | Manage users |
| GET/POST | `/api/admin/draws` | JWT + admin | Draw history |
| POST | `/api/admin/draws/simulate` | JWT + admin | Generate draw numbers |
| POST | `/api/admin/draws/publish` | JWT + admin | Publish draw + notify |
| CRUD | `/api/admin/charities` | JWT + admin | Manage charities |
| GET/PATCH | `/api/admin/winners` | JWT + admin | Verify + pay winners |
| GET | `/api/admin/reports` | JWT + admin | Analytics |

---

## PRD Compliance

| Requirement | Status |
|---|---|
| Subscription plans (Monthly/Yearly) | ✅ |
| Rolling 5-score logic (1–45 Stableford) | ✅ |
| Draw engine (random + algorithmic) | ✅ |
| Prize pool splits (40/35/25%) | ✅ |
| Jackpot rollover | ✅ |
| Charity selection + contribution % | ✅ |
| One-off donations | ✅ |
| Winner verification flow | ✅ |
| Admin dashboard (all 6 sections) | ✅ |
| JWT authentication + subscription gating | ✅ |
| Email notifications | ✅ |
| Supabase backend with schema | ✅ |
| Stripe payment integration | ✅ |
| Mobile-responsive design | ✅ |
| React Router SPA with protected routes | ✅ |
