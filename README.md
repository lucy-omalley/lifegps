# LifeGPS

**Navigate your future with AI.**

LifeGPS is an AI Life Architect MVP by [RemoteGeek Hub](https://remotegeekhub.com). It helps professionals escape burnout, change careers, build side businesses, improve communication, and design their dream life.

## Features

- **Landing Page** — Premium marketing site with hero, problem/solution, features, and pricing
- **LifeGPS Compass™ Assessment** — Interactive 50-question personality-style onboarding (~8 minutes)
- **AI Life Blueprint** — OpenAI-powered personalised roadmap with archetype, compass scores, and action plans
- **Dashboard** — Track dream life summary, goals, priorities, and habits
- **Weekly AI Coach** — Chat-style check-in with supportive coaching responses

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
2. Complete the LifeGPS Compass™ Assessment (50 questions, ~8 minutes)
3. View your LifeGPS Archetype reveal and AI-generated Life Blueprint
4. Check your Dashboard for goals and habits
5. Use Weekly Coach for progress check-ins

## LifeGPS Compass™ Assessment

### How it works

1. **Intro screen** — Sets expectations (~8 minutes, 50 questions)
2. **One question per screen** — Multiple choice, scale (1–10), and scenario-based questions across 8 dimensions
3. **Progress saved locally** — Answers persist in `localStorage` during the session
4. **Scoring** — Client-side dimension scores, strengths, growth areas, burnout risk, and archetype assignment
5. **Reveal sequence** — Analysing → Archetype → Blueprint generation
6. **Life Blueprint** — AI generates a personalised roadmap using all answers, scores, and archetype

### 8 Compass dimensions

| Dimension | Questions |
|-----------|-----------|
| Purpose & Direction | 1–6 |
| Career & Work Energy | 7–12 |
| Skills & Growth | 13–18 |
| Communication & Confidence | 19–24 |
| Side Business & Creativity | 25–30 |
| Money & Freedom | 31–36 |
| Energy, Burnout & Lifestyle | 37–42 |
| Execution & Habits | 43–50 |

### How scoring works

- **Scale questions (1–10):** Numeric value × 10 = score contribution (Q24 is inverted — higher limitation = lower score)
- **Choice questions:** Each option has a semantic score (0–100) defined in the question data
- **Dimension score:** Average of all question scores in that dimension, normalised to 0–100
- **Top strengths / growth areas:** Highest and lowest 2 dimension scores
- **Burnout risk:** Derived from energy, career, and burnout-related answers (Low / Medium / High)
- **Archetype:** Assigned from weighted rules based on dimension scores and key answers

### Where to edit

| What | File |
|------|------|
| Questions (text, options, scores) | `src/lib/compass/questions.ts` |
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
3. **Enable Anonymous Sign-In:** Dashboard → Authentication → Providers → Anonymous → Enable
4. Add env vars to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart the dev server

### What gets stored

| Table | Data |
|-------|------|
| `compass_sessions` | In-progress assessment answers (synced on each question) |
| `assessments` | Completed Compass assessment + scores + archetype (JSONB) |
| `life_blueprints` | Full AI-generated blueprint |
| `weekly_checkins` | Coach check-in history |

The app signs users in **anonymously** on first visit (cookie session). Data is protected by Row Level Security — each user only sees their own rows.

Without Supabase env vars, the app falls back to **localStorage only** (same as before).

> **Future:** Replace anonymous auth with email/OAuth in `src/lib/auth.ts` when ready for production accounts.

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
│   └── api/
│       ├── blueprint/        # OpenAI blueprint generation
│       └── coach/            # OpenAI coaching
├── components/
│   ├── landing/              # Landing page sections
│   ├── assessment/           # Compass intro, questions, reveal
│   ├── blueprint/            # Blueprint display
│   ├── dashboard/            # Dashboard view
│   ├── coach/                # Coach chat
│   └── layout/               # Header & footer
├── lib/
│   ├── compass/              # Questions, scoring, archetypes
│   ├── data/sync.ts          # Client ↔ Supabase sync helpers
│   ├── auth.ts               # Supabase anonymous auth (+ localStorage fallback)
│   ├── storage.ts            # localStorage helpers
│   ├── openai/               # OpenAI client & prompts
│   └── supabase/             # Supabase clients
├── store/
│   └── assessment.ts         # Jotai atoms
└── types/
    └── index.ts              # TypeScript types
```

## TODO

- [ ] Replace mock auth with Supabase Auth
- [ ] Integrate Stripe for Premium (€9/month)
- [ ] Persist habits with completion tracking in Supabase
- [ ] Add email notifications for weekly check-in reminders
- [ ] Export blueprint as PDF

## License

Private — RemoteGeek Hub © 2026
