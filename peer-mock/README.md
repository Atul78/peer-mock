# PeerMock — Peer Mock-Interview Slot Booking

A platform where developers list free time slots to *host* a mock interview,
and other developers *book* those slots to practice as the candidate. After a
session, the host leaves structured feedback (communication, technical depth,
problem-solving) so the candidate can track how they're improving over time.

Built for the House of Edtech Fullstack Developer take-home assignment
(Sep 2026).

## Why this isn't "just CRUD"

- **Two-sided booking with race protection** — an atomic `findOneAndUpdate`
  guard stops two candidates from booking the same slot at once.
- **Double-booking prevention** — a host can't create two overlapping slots,
  and a candidate can't book two overlapping sessions.
- **Time-based status transitions** — slots and bookings move through
  `open → booked → completed` automatically based on the clock, not a manual
  flag.
- **Rule-based cancellation** — cancelling is only allowed more than 2 hours
  before a session.
- **Role-scoped actions** — only the host of a slot can leave feedback for
  it, only after the session has actually ended.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **MongoDB** with **Mongoose**
- **Tailwind CSS v4**
- Auth: custom JWT stored in an httpOnly cookie (bcrypt-hashed passwords)

No AI integration, automated tests, or a written security-mitigation doc are
included in this build, by design.

## Project structure

```
src/
  app/                 pages + API routes (App Router)
    api/                REST-style route handlers (auth, slots, bookings, feedback, dashboard)
    slots/, dashboard/, bookings/...   pages
  components/           shared UI (Navbar, Footer, SlotCard, StatusPill, ...)
  lib/
    models/              Mongoose schemas (User, Slot, Booking, Feedback)
    db.ts                 cached Mongoose connection
    auth.ts                JWT sign/verify + session helper
    validators.ts           input validation/sanitization
    constants.ts              TECH_STACKS (shared by client + server)
  proxy.ts               route protection (Next.js 16's middleware replacement)
```

## Running it locally

### 1. Install dependencies

```bash
npm install
```

### 2. Get a MongoDB connection string

Easiest option — a free MongoDB Atlas cluster:

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free (M0) cluster.
3. Under **Database Access**, add a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) —
   fine for a project like this.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
   Add a database name before the `?`, e.g. `.../peermock?retryWrites=...`.

(Or point `MONGODB_URI` at a local `mongod` instance if you have one running.)

### 3. Set environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://...your Atlas string.../peermock?retryWrites=true&w=majority
JWT_SECRET=some-long-random-string   # generate with: openssl rand -base64 32
```

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Sign up, host a slot, then open an incognito
window and sign up as a second user to book it — that's the full loop.

### 5. Build check before deploying

```bash
npm run build
```

## Deploying to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com → **Add New → Project** → import your GitHub repo.
3. Vercel auto-detects Next.js — no build settings need changing.
4. Under **Environment Variables**, add the same two variables from
   `.env.local`: `MONGODB_URI` and `JWT_SECRET`.
5. Click **Deploy**. Every push to your main branch redeploys automatically
   (that's your CI/CD).
6. Make sure your Atlas cluster's Network Access still allows `0.0.0.0/0` (or
   add Vercel's egress IPs) so the deployed app can reach the database.

## Before you submit

- [ ] Open `src/components/Footer.tsx` and replace `YOUR_GITHUB_USERNAME`
      and `YOUR_LINKEDIN_USERNAME` with your real profile URLs.
- [ ] Push the repo to GitHub (don't commit `.env.local` — it's already
      gitignored).
- [ ] Deploy on Vercel and confirm signup → host slot → book (2nd account) →
      feedback flow works end to end on the live URL.
- [ ] Submit the GitHub repo link + the live Vercel URL.
