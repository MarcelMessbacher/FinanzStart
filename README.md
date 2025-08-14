# FinanzStart

A finance-learning game. Fresh out of high school, choose your path to financial independence.

Requirements implemented:
- Session-based gameplay: state is stored in sessionStorage and reset on new visit
- Landing page with start button
- Intro dialog
- Choose to work or study; realistic sample salaries
- Monthly confirmation advances time and age
- Housing choices and parental rent after 21 with monthly increase
- Base expenses and investments with passive income
- Buying a house (cash or mortgage) with a cap relative to cashflow
- Leaderboards API (in-memory) and Prisma schema (SQLite)

Getting started:
1) Install Node.js 18+
2) `npm install`
3) `npx prisma db push` (optional to create SQLite for persistent leaderboards)
4) `npm run dev`

GitHub Pages (static export):
- `npm run export` → outputs static site to `docs/` (required Pages folder)
- Commit and push, then set Pages source to the root `/docs` folder on the default branch
- Note: API routes (e.g. `/api/leaderboard`) are not available on Pages

Endpoints:
- `/` Landing page
- `/game` Game UI
- `/leaderboard` Leaderboards (reads from `/api/leaderboard` in-memory; switch to `/api/leaderboard/db-route` after DB setup)

Environment:
- `DATABASE_URL="file:./dev.db"` for Prisma SQLite

Deploying to GitHub Pages:
- Update `next.config.mjs` `basePath` and `assetPrefix` to match your repo name if it differs from `FinanzStart`.
- Run `npm run export` to generate `docs/`.
- In GitHub settings, set Pages source to `Deploy from a branch` → default branch → `/docs` folder.

