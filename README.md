# Freevid

Anonymous video sharing — no accounts required. Upload, watch, comment, like, and dislike videos.

Built as a static React app for [GitHub Pages](https://pages.github.com), with [Supabase](https://supabase.com) (free tier) handling storage and data.

## Features

- Upload videos with title, your name, and description (MP4/WebM)
- Browse and watch videos
- Like and dislike (one vote per browser)
- Comment with your name (no login)

## Quick setup (~5 minutes)

### 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Create a new project and wait for it to finish provisioning.

### 2. Run the database schema

1. In Supabase, open **SQL Editor**.
2. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
3. This creates the tables, storage bucket, and security policies.

### 3. Get your API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.

### 4. Local development

```bash
cp .env.example .env
# Edit .env and paste your Supabase URL and anon key

npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In your repo, go to **Settings → Secrets and variables → Actions** and add:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon public key
3. Push to the `main` branch. GitHub Actions builds and deploys to the `gh-pages` branch.
4. In **Settings → Pages**, set source to **Deploy from branch**, branch `gh-pages`, folder `/ (root)`.
5. Your site will be live at `https://<username>.github.io/freevid/`

> If your repo name is not `Freevid`, update the `base` path in [`vite.config.js`](vite.config.js) and the workflow env to match.

## Free tier limits

Supabase free tier includes ~1 GB of file storage and 2 GB bandwidth per month.

### Upload size limits

| Limit | Free plan |
|-------|-----------|
| Max single file | **50 MB** (Supabase hard cap) |
| Total storage | ~1 GB |

If uploads fail with **"The object exceeded the maximum allowed size"**:

1. **Dashboard → Storage → Settings** — set **Global file size limit** to **50 MB**
2. **Dashboard → Storage → videos → ⋮ → Edit bucket** — disable **Restrict file size**
3. Or run [`supabase/remove-upload-limit.sql`](supabase/remove-upload-limit.sql) in the SQL Editor (removes the old 25 MB bucket cap)

Videos larger than 50 MB require a Supabase Pro plan or compressing the file before upload.

## Keep Supabase from pausing

Free Supabase projects pause after ~7 days of inactivity. See [`keepalive/README.md`](keepalive/README.md) for a free Cloudflare Worker that pings your database and streams part of a video once a day.

## Managing content

There is no admin panel. To remove spam or bad uploads, use the Supabase dashboard:

- **Table Editor** — delete rows from `videos`, `comments`, or `reactions`
- **Storage** — delete files from the `videos` bucket

## Tech stack

- Vite + React
- React Router (HashRouter for GitHub Pages)
- Supabase (Storage + Postgres)
- GitHub Actions + GitHub Pages
