# LifeGPS

**Navigate your future with AI.**

LifeGPS is an AI Life Architect MVP by [RemoteGeek Hub](https://remotegeekhub.com). It helps professionals escape burnout, change careers, build side businesses, improve communication, and design their dream life.

## Features

- **Landing Page** — Premium marketing site with hero, problem/solution, features, and pricing
- **Life Assessment** — 5-step multi-page form covering personality, current life, dreams, and barriers
- **AI Life Blueprint** — OpenAI-powered personalized roadmap (5-year, 12-month, 90-day plans)
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
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (server-side) |

\* Without `OPENAI_API_KEY`, the app falls back to mock AI responses so you can demo the full flow.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Try the flow

1. Visit the landing page and click **Create My Life Blueprint**
2. Complete the 5-step assessment
3. View your AI-generated Life Blueprint
4. Check your Dashboard for goals and habits
5. Use Weekly Coach for progress check-ins

## Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Add your Supabase env vars to `.env.local`
4. Enable auth providers in Supabase Dashboard

> **MVP Note:** Auth uses a mock user stored in localStorage. Replace with Supabase Auth when ready — see `src/lib/auth.ts`.

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
│   ├── assessment/           # Multi-step assessment
│   ├── blueprint/            # AI blueprint results
│   ├── dashboard/            # Progress dashboard
│   ├── coach/                # Weekly AI coach
│   └── api/
│       ├── blueprint/        # OpenAI blueprint generation
│       └── coach/            # OpenAI coaching
├── components/
│   ├── landing/              # Landing page sections
│   ├── assessment/           # Form steps
│   ├── blueprint/            # Blueprint display
│   ├── dashboard/            # Dashboard view
│   ├── coach/                # Coach chat
│   └── layout/               # Header & footer
├── lib/
│   ├── auth.ts               # Mock auth (TODO: Supabase)
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
