# LifeGPS

**Navigate your future with AI.**

LifeGPS is an AI Life Architect MVP by [RemoteGeek Hub](https://remotegeekhub.com). It helps professionals escape burnout, change careers, build side businesses, improve communication, and design their dream life.

## Features

- **Landing Page** — Premium marketing site with hero, problem/solution, features, and pricing
- **LifeGPS Compass™ Assessment** — Short discovery journey onboarding (20 questions, ~3–5 minutes)
- **AI Life Blueprint** — OpenAI-powered personalised roadmap with archetype, compass scores, and action plans
- **Dashboard** — Track dream life summary, goals, priorities, and habits
- **Weekly AI Coach** — Chat-style check-in with supportive coaching responses
- **Founder Agent** — Internal dashboard at `/founder-agent` for product validation

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Jotai
- **Database:** Supabase (with localStorage fallback for MVP)
- **AI:** OpenAI API (gpt-4o-mini)
- **Deployment:** Vercel-ready

## Quick Start

### 1. Clone and install

```bash
cd lifegps
npm install
```

### 2. Configure environment

Copy the example env file and add your keys:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes* | OpenAI API key for blueprint & coaching |
| `NEXT_PUBLIC_SUPABASE_URL` | For DB* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For DB* | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Optional admin key — not required for normal app use |

\* Without Supabase env vars, data is stored in localStorage only.

\* Without `OPENAI_API_KEY`, the app falls back to mock AI responses so you can demo the full flow.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Try the flow

1. Visit the landing page and click **Create My Life Blueprint**
2. Complete the LifeGPS Compass™ discovery journey (20 questions, ~3–5 minutes)
3. View your LifeGPS Archetype reveal and AI-generated Life Blueprint
4. Check your Dashboard for goals and habits
5. Use Weekly Coach for progress check-ins

## LifeGPS Compass™ Assessment

### How it works

1. **Intro screen** — Sets expectations (~3–5 minutes, 7 sections)
2. **One question per screen** — Conversational multiple choice, multi-select, and sliders across 7 sections
3. **Progress saved locally** — Answers persist in `localStorage` during the session (and sync to Supabase when configured)
4. **Scoring** — Client-side inference from fewer answers: 6 compass scores, strengths, growth areas, burnout risk, readiness signals, and archetype
5. **Reveal sequence** — Animated results → Archetype → Blueprint generation
6. **Life Blueprint** — AI generates a personalised roadmap using answers, scores, adaptive signals, and archetype

### 7 discovery sections

| Section | Questions |
|---------|-----------|
| Your Direction | 1–3 |
| How You Naturally Work | 4–6 |
| Career | 7–9 |
| Lifestyle & Energy | 10–12 |
| Money & Freedom | 13–15 |
| Growth & Confidence | 16–18 |
| Final Reflection | 19–20 (+ optional note) |

### 6 Compass dimensions

Purpose · Career · Energy · Communication · Freedom · Execution

### How scoring works

- **Scale questions (1–10):** Numeric value × 10 = score contribution
- **Choice questions:** Each option has a semantic score (0–100) defined in the question data
- **Cross-inference:** Fewer answers infer more — e.g. burnout signals boost energy/career risk scoring
- **Dimension score:** Weighted average of answers mapped to each of 6 compass dimensions
- **Adaptive signals:** Side business, early retirement, career change, and burnout flags stored for coach follow-up
- **Top strengths / growth areas:** Highest and lowest 2 dimension scores
- **Burnout risk:** Derived from energy, career, and burnout-related answers (Low / Medium / High)
- **Archetype:** Assigned from weighted rules based on dimension scores and key answers

### Where to edit

| What | File |
|------|------|
| Questions (text, options, scores) | `src/lib/compass/questions.ts` |
| Section structure (7 steps) | `src/lib/compass/sections.ts` |
| Dimension labels | `src/lib/compass/dimensions.ts` |
| Scoring logic | `src/lib/compass/scoring.ts` |
| Archetypes & descriptions | `src/lib/compass/archetypes.ts` |
| AI blueprint prompt | `src/lib/openai/prompts.ts` |
| Assessment UI | `src/components/assessment/` |
| TypeScript types | `src/types/index.ts` |

## Supabase Setup (Database Persistence)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor  
   - If you already ran an older schema, also run `supabase/migrations/002_compass_persistence.sql`
3. **Enable Email auth:** Dashboard → Authentication → Providers → **Email** → Enable (magic link / OTP)
4. **Redirect URLs:** Authentication → URL Configuration → add:
   - Site URL: `http://localhost:3000` (or your production domain)
   - Redirect URLs: `http://localhost:3000/auth/callback` and your production callback URL
5. **CAPTCHA (optional):** If you turn on Bot and Abuse Protection, add Cloudflare Turnstile:
   - Create a site at [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
   - Supabase → Authentication → Bot and Abuse Protection → enable Turnstile and paste the **secret key**
   - Add to `.env.local`: `NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key`
6. Add env vars to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Required when Supabase CAPTCHA / Turnstile is enabled:
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

7. Restart the dev server

### Authentication flow

Users sign in at **`/login`** with an **email magic link** (no password). After clicking the link in their email, Supabase redirects to `/auth/callback`, which creates a session cookie. Protected routes (journey, assessment, profile, etc.) require sign-in when Supabase is configured.

The landing page (`/`) is public. Without Supabase env vars, the app uses **localStorage only**.

### What gets stored

| Table | Data |
|-------|------|
| `compass_sessions` | In-progress assessment answers (synced on each question) |
| `assessments` | Completed Compass assessment + scores + archetype (JSONB) |
| `life_blueprints` | Full AI-generated blueprint |
| `weekly_checkins` | Coach check-in history |

Data is protected by Row Level Security — each signed-in user only sees their own rows.

Without Supabase env vars, the app uses **localStorage only** (same as before).

## Founder Agent (Internal)

Internal dashboard at **`/founder-agent`** for validating and growing LifeGPS.

### How it works

1. **Admin gate** — Enter email matching `ADMIN_EMAIL` (local dev works without it set)
2. **Metrics dashboard** — Aggregated, anonymised stats from Supabase or mock data
3. **Founder Agent chat** — AI advisor with full product context injected per message
4. **Weekly Founder Plan** — One-click AI plan for product, marketing, pricing, and retention
5. **Feedback analysis** — `analyseFeedback()` utility + Feedback Analyst Agent

### Required environment variables

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Founder login email (production) |
| `SUPABASE_SERVICE_ROLE_KEY` | Live metrics aggregation (server-only) |
| `OPENAI_API_KEY` | Founder chat + weekly plan AI (optional — mock fallback) |

### Where agent prompts live

| Agent | File |
|-------|------|
| LifeGPS Coach (blueprint, coach) | `src/lib/agents/lifegpsCoachAgent.ts` + `src/lib/openai/prompts.ts` |
| Founder Agent | `src/lib/agents/founderAgent.ts` |
| Feedback Analyst | `src/lib/agents/feedbackAnalystAgent.ts` |

### Connect Supabase data

1. Run `supabase/schema.sql` and `supabase/migrations/003_founder_agent_feedback.sql`
2. Set `SUPABASE_SERVICE_ROLE_KEY` for aggregated founder metrics
3. Metrics pull from: `assessments`, `life_blueprints`, `blueprint_feedback`, `weekly_checkins`

Without Supabase, the dashboard uses **mock data** (clearly labelled).

### Test locally

```bash
# .env.local
ADMIN_EMAIL=you@example.com
npm run dev
# Visit http://localhost:3000/founder-agent
```

### Data safety

- Founder dashboard shows **aggregates only** — no full names or individual PII
- Reflections are anonymised before display
- **TODO:** Replace email gate with role-based access control before production

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables (`OPENAI_API_KEY`, Supabase keys)
4. Deploy

```bash
npm run build  # verify locally first
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── assessment/           # Compass assessment
│   ├── blueprint/            # AI blueprint results
│   ├── dashboard/            # Progress dashboard
│   ├── coach/                # Weekly AI coach
│   ├── founder-agent/        # Internal founder dashboard
│   └── api/
│       ├── assessment/       # Compass session + completed assessment
│       ├── blueprint/        # Life Blueprint generation
│       ├── coach/            # Weekly coaching
│       └── founder-agent/    # Founder metrics, chat, weekly plan
├── components/
│   ├── landing/
│   ├── assessment/
│   ├── blueprint/
│   ├── dashboard/
│   ├── coach/
│   ├── founder/              # Founder dashboard, chat, gate
│   └── layout/
├── lib/
│   ├── agents/               # Coach, Founder, Feedback Analyst agents
│   ├── compass/
│   ├── founder/              # Metrics + analyseFeedback()
│   ├── data/sync.ts
│   ├── auth.ts
│   ├── admin.ts              # ADMIN_EMAIL access check
│   ├── storage.ts            # localStorage helpers
│   ├── openai/               # OpenAI client & prompts
│   └── supabase/             # Supabase clients
├── store/
│   └── assessment.ts         # Jotai atoms
└── types/
    └── index.ts              # TypeScript types
```

## TODO

- [ ] Replace founder email gate with role-based access control
- [ ] Add user-facing blueprint rating UI (feeds founder metrics)
- [ ] Integrate Stripe for Premium (€9/month)
- [ ] Persist habits with completion tracking in Supabase
- [ ] Add email notifications for weekly check-in reminders
- [ ] Export blueprint as PDF

## License

Private — RemoteGeek Hub © 2026
