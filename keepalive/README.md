# Freevid Supabase keepalive

A free Cloudflare Worker that runs **once a day** and keeps your Supabase project active by:

1. Querying the `videos` table
2. Fetching the first ~512 KB of the newest video (simulates starting playback)
3. Pinging the GitHub Pages site

Supabase pauses free projects after inactivity. This Worker generates real API and storage traffic so that does not happen.

## Setup (~3 minutes)

### 1. Install and log in to Cloudflare

```bash
cd keepalive
npm install
npx wrangler login
```

### 2. Add secrets

Use the same values as your Freevid `.env`:

```bash
npx wrangler secret put SUPABASE_URL
# paste: https://zubjwieiyncyhpfcrqyt.supabase.co

npx wrangler secret put SUPABASE_ANON_KEY
# paste: your sb_publishable_... key
```

### 3. Deploy

```bash
npm run deploy
```

The cron runs daily at **12:00 UTC**. You can test immediately by visiting the Worker URL (shown after deploy) in your browser — it should return `OK: ...`.

### 4. Confirm it works

```bash
npm run tail
```

Then open the Worker URL in another tab. You should see log output in the tail session.

## Schedule

Default: `0 12 * * *` (once per day at noon UTC).

To change it, edit `crons` in [`wrangler.jsonc`](wrangler.jsonc).

## Cost

Cloudflare Workers free tier includes cron triggers. One daily run uses a tiny fraction of the free allowance.
