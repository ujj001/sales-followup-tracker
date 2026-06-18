# Sales Follow-up Manager

A lightweight tool so sales reps never miss a follow-up. The homepage shows
only companies whose follow-up is **due today or overdue**, and each company is
assigned to a sales rep.

## Stack
Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · **Neon Postgres** (shared cloud DB)

## Features
- **Today** — follow-ups due today/overdue for everyone by default, with a **Complete Call** action and an optional **Rep filter**.
- **Complete Call** modal — Outcome, "Follow-up in" (1/2/3/7/14/custom), Notes. On save: `Last Contacted = today`, `Next Follow-up = today + N`, notes updated, drops off today's list, logged to history.
- **All Companies** — search (company/contact/rep/email/phone), edit, delete.
- **Counts** — Overdue, Due Today, Upcoming.

## How the team shares data
Everyone runs the app pointing at the **same Neon Postgres database**, so all
edits are shared through the database and open tabs auto-refresh from the server.
The database lives in the cloud (private, credential-protected) — nothing is
publicly hosted.

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
npm run db:check     # verify which shared Neon DB this machine is using
npm run db:studio    # browse the DB in Prisma Studio
npx prisma migrate dev --name <name>   # create a new migration after schema changes
```

## Data source of truth
- Companies, call history, and notification dedupe records live only in Neon
  Postgres through Prisma.
- The browser does not store company data in local storage/session storage.
- Open tabs refresh their server-rendered data every 15 seconds and whenever the
  tab becomes active, so changes from coworkers are pulled from Neon
  automatically.
- The notification trigger only calls `/api/notify`; that API re-queries Neon for
  due companies and writes `NotificationLog` rows in Neon to prevent duplicate
  sends across machines.
- To confirm every machine is on the same database, run `npm run db:check` and
  compare `database.host`, `database.database`, and the counts.

## Notes
- Changes from coworkers appear automatically while the app is open. Each tab
  polls by refreshing server-rendered data from Neon.
- No login yet — the app is meant to run privately (locally or on a trusted
  host). If you put it on a public URL, add authentication first.
