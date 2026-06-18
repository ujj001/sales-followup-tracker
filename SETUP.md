# Teammate Setup Guide

Run the Sales Follow-up Manager on your laptop. Everyone connects to the **same
shared cloud database**, so all data and follow-ups are shared automatically.

> ⚠️ **Do NOT run `npm run db:seed`** — it wipes the shared database and replaces
> it with demo data. Only the admin should ever run that.

---

## 1. Install Node.js (one-time)
Download the **LTS** version from <https://nodejs.org> and install it.
Verify in a terminal:
```bash
node --version    # should print v18 or higher
```

## 2. Install Git (one-time)
- **Mac:** run `git --version` — if missing, it will prompt to install (accept).
- **Windows:** download from <https://git-scm.com/download/win> and install.

## 3. Get access to the repo
Ask the admin to add you as a collaborator on the GitHub repo, then accept the
email invite.

## 4. Clone the project
```bash
git clone https://github.com/ujj001/sales-followup-tracker.git
cd sales-followup-tracker
```

## 5. Install dependencies
```bash
npm install
```

## 6. Add the shared credentials
Create your `.env` file from the template and paste the values the admin sends
you (privately — never commit them):
```bash
cp .env.example .env
nano .env        # paste values, then Ctrl+O Enter to save, Ctrl+X to exit
```
(Or `open -e .env` to edit in TextEdit on Mac.)

## 7. Run it
```bash
npm run dev
```
Open <http://localhost:3000> in your browser. You're in.

---

## Daily use
Just `cd sales-followup-tracker && npm run dev` whenever you want to use it.

## To get the latest version later
```bash
git pull
npm install
```
