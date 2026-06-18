# Sales Follow-up Manager

A lightweight tool so sales reps never miss a follow-up. The homepage shows
only companies whose follow-up is **due today or overdue**, and each company is
assigned to a sales rep.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · **Neon Postgres** (shared cloud DB)

## Features
- **Today** — follow-ups due today/overdue, with a **Complete Call** action and a **Rep filter** (each rep sees their own).
- **Complete Call** modal — Outcome, "Follow-up in" (1/2/3/7/14/custom), Notes. On save: `Last Contacted = today`, `Next Follow-up = today + N`, notes updated, drops off today's list, logged to history.
- **All Companies** — search (company/contact/rep/email/phone), edit, delete.
- **Counts** — Overdue, Due Today, Upcoming.

## How the team shares data
Everyone runs the app pointing at the **same Neon Postgres database**, so all
edits are instantly shared (visible on refresh). The database lives in the cloud
(private, credential-protected) — nothing is publicly hosted.

## Setup for a teammate
```bash
git clone <your-private-repo>
cd followup-manager
npm install
cp .env.example .env     # paste the shared Neon creds into .env (sent to you privately)
npm run dev              # http://localhost:3000
```

> 🔒 The real `.env` (with the Neon connection string) is **gitignored** — it is
> never committed. Share the creds privately (password manager / DM). The repo
> only carries `.env.example` with placeholders.

## Environment variables (`.env`)
```
DATABASE_URL=   # Neon pooled connection (…-pooler… host, used at runtime)
DIRECT_URL=     # Neon direct connection (no -pooler, used for migrations)
```

## Useful commands
```bash
npm run dev          # dev server
npm run build        # prod build (runs prisma generate + migrate deploy)
npm start            # prod server on 0.0.0.0:3000
npm run db:seed      # load sample companies
npm run db:studio    # browse the DB in Prisma Studio
npx prisma migrate dev --name <name>   # create a new migration after schema changes
```

## Notes
- Changes appear for other users on page **refresh** (no live push). Real-time
  updates can be added later (polling or Neon/Postgres `LISTEN/NOTIFY`).
- No login yet — the app is meant to run privately (locally or on a trusted
  host). If you put it on a public URL, add authentication first.
