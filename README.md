# textbook-learning-assistant

Korean math practice platform for high school students, inspired by [Gicheul TapTap](https://gicheultaptap.com/).

## Features

- **Problem Bank** -- Categorized math problems by unit, type, and difficulty
- **Quiz Engine** -- Auto-graded multiple choice and short answer quizzes
- **Wrong Note Tracker** -- Auto-collects mistakes for spaced repetition review
- **DIY Workbooks** -- Create custom problem sets by unit/type/difficulty
- **AI Analysis** -- Bayesian Knowledge Tracing identifies weak areas and recommends practice
- **Learning Dashboard** -- Achievement visualization, mastery map, calendar planner
- **Gamification Mode** -- XP/Level system, combo streaks, daily challenges, monster encyclopedia, 4 mini-games with 3D backgrounds and sound effects
- **Instructor Portal** -- Problem management, class groups, student analytics, AI-assisted question generation
- **PWA** -- Installable, offline-capable progressive web app
- **Desktop App** -- Electrobun-based native desktop wrapper

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, Vite 7, Tailwind CSS v4, shadcn/ui, Radix UI |
| 3D / Game | Three.js, React Three Fiber, Phaser 3, Canvas Confetti |
| Animation | Framer Motion, Swiper |
| Audio | Howler.js |
| Math | KaTeX, MathLive |
| Charts | Recharts |
| AI | Google Generative AI SDK (Gemini) |
| Backend | Express 5, Drizzle ORM, PostgreSQL, JWT, bcrypt |
| Desktop | Electrobun |
| Testing | Vitest, @vitest/coverage-v8 |
| Package Manager | pnpm (workspaces) |

## Project Structure

```
apps/
  web/       React 19 web application (PWA)
  api/       Express 5 REST API
  desktop/   Electrobun desktop wrapper
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL (for API server; web POC uses localStorage + IndexedDB)

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start web dev server
pnpm web:dev

# Start API dev server (requires PostgreSQL)
pnpm api:dev

# Or start both
./start.sh all
```

## Available Scripts

```bash
pnpm web:dev          # Web dev server (Vite)
pnpm web:build        # Build web app
pnpm api:dev          # API dev server (tsx watch)
pnpm api:build        # Build API
pnpm api:db:generate  # Generate Drizzle schema
pnpm api:db:migrate   # Run database migrations
```

## Environment Variables

See `.env.example` for required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT access token signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token signing secret |
| `PORT` | API server port (default: 3000) |
| `CORS_ORIGIN` | Allowed CORS origin |

## Testing

```bash
# Run tests
pnpm --filter web test

# Watch mode
pnpm --filter web test:watch
```

## Version History

| Version | Description |
|---------|-------------|
| v1.0 | MVP -- Auth, problem bank, quiz engine, wrong notes, workbooks, AI analytics, PWA, instructor portal |
| v2.0 | Design overhaul -- Gicheul TapTap-style UI, animations, Framer Motion, Swiper, planner |
| v3.0 | Gamification -- Flip Mode with Phaser/Three.js/Howler.js, XP/Level/Combo, 4 mini-games, 3D backgrounds |
| v4.0 | *(In progress)* PDF 2-Way Learning System |

## License

[MIT](LICENSE)
