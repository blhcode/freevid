# Freevid Supabase keepalive

A free Cloudflare Worker that runs once a day and keeps your Supabase project active by querying videos, streaming part of the newest upload, and pinging the GitHub Pages site.

## Deploy via GitHub Actions

1. Create a Cloudflare API token using the Edit Cloudflare Workers template
2. Add repository secret CLOUDFLARE_API_TOKEN
3. Run Actions workflow Deploy keepalive worker

Existing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY secrets are reused.

Runs daily at 12:00 UTC. Free on Cloudflare Workers.
