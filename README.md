# Rags to Riches

**Pocket Money to Prosperity** is a student finance app for tracking pocket money, part-time income, everyday spending and small savings. Its purpose is to help students see what they can safely spend, plan a budget and build better money habits. It records money entered by the student; it does not connect to a bank or move real money.

## What you can do

- Record and edit income and expenses, then see an accurate available-to-spend balance.
- Set a monthly budget, receive spending alerts and save toward goals.
- Schedule recurring entries, review spending reports and export your data.
- Follow short money lessons that remember your progress.
- Manage your account and reset a password with a saved recovery code.

## Technology

Next.js and React provide the pages and server actions. TypeScript, Tailwind CSS, Auth.js, Prisma and PostgreSQL provide typed code, styling, sign-in, database access and persistent storage. Neon hosts the PostgreSQL database.

## Run locally

Requires Node.js 24.x, matching the Vercel runtime setting in `package.json`.

```bash
npm ci
cp -n .env.example .env
# In .env, set Neon DATABASE_URL (pooled), DIRECT_URL (direct), a strong AUTH_SECRET,
# and AUTH_TRUST_HOST=true.
npm run db:setup
npm run dev
```

Open `http://localhost:3000`, register and save the recovery code shown once. The setup command creates tables but does not add demo users or transactions.

## Deploy on Vercel

Set `DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon direct), a strong `AUTH_SECRET`, and `AUTH_TRUST_HOST=true` in Vercel Project Settings. The migration has already been applied to the supplied Neon database; for a new database, run `npm run db:setup` before deploying. Vercel’s build generates Prisma Client automatically. Never upload a real `.env` file.
