# Teammate Setup Guide (Mac)

From a brand-new Mac to the app running. Copy-paste each command into the
**Terminal** app (find it: press `Cmd+Space`, type "Terminal", hit Enter).

Everyone connects to the **same shared cloud database**, so all data and
follow-ups are shared automatically.

> ⚠️ **Two rules:**
> 1. There is no seed/wipe command in the app. Do not add or run scripts that
>    bulk-delete shared database rows.
> 2. **Never share or commit your `.env` file** — it holds the team credentials.
>    (The repo is public, so this matters: a leaked `.env` would be visible to everyone.)

---

## Step 1 — Install Homebrew (the installer for the tools below)
Paste this and follow the prompts (it may ask for your Mac password):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
When it finishes, **Apple Silicon Macs (M1/M2/M3)** must run this so `brew` works:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```
Check it worked:
```bash
brew --version
```

## Step 2 — Install Node and Git
```bash
brew install node git
```
Check:
```bash
node --version    # v18 or higher
git --version
```

## Step 3 — Download the project
```bash
cd ~/Documents
git clone https://github.com/ujj001/sales-followup-tracker.git
cd sales-followup-tracker
```

## Step 4 — Install the app's dependencies
```bash
npm install
```

## Step 5 — Add the team credentials
Your admin will send you the secret values privately. Create the file and paste them:
```bash
cp .env.example .env
nano .env
```
In nano: delete the placeholder lines, paste the values the admin sent, then
**Ctrl+O** → Enter (save), **Ctrl+X** (exit).
*(Prefer a window? Use `open -e .env` to edit in TextEdit instead.)*

## Step 6 — Run the app
```bash
npm run dev
```
Open **http://localhost:3000** in your browser. Done! 🎉

---

## Every day after this
```bash
cd ~/Documents/sales-followup-tracker
npm run dev
```

## Updating to the latest version
When the admin says there's an update:
```bash
cd ~/Documents/sales-followup-tracker
git pull        # get the latest code
npm install     # update dependencies + refresh the database client
```
Then **restart the app**: in the terminal running it, press `Ctrl+C` to stop, then:
```bash
npm run dev
```
That's all you do — database changes are handled centrally by the admin, not on
your machine.

## Something broke?
- `command not found: brew` → re-run the two Apple-Silicon lines in Step 1.
- `command not found: npm` → re-run Step 2.
- Page won't load → make sure the `npm run dev` terminal is still open and shows
  "Ready". Keep that window open while using the app.

---

## For the admin: shipping an update
1. Make your code changes and, if the database schema changed, create a migration:
   ```bash
   npx prisma migrate dev --name describe_change   # applies to the shared DB
   ```
2. Push to GitHub:
   ```bash
   git add -A && git commit -m "your change" && git push
   ```
3. Tell teammates to run the **Updating to the latest version** steps above.

Because the database is shared (Neon), the migration only needs to run **once**
(by you) — teammates just `git pull && npm install` to get matching code.
