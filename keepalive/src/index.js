const SITE_URL = 'https://blhcode.github.io/freevid/';

async function keepAlive(env) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY secrets');
  }

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const steps = [];

  const listRes = await fetch(
    `${SUPABASE_URL}/rest/v1/videos?select=id,title,storage_path&order=created_at.desc&limit=1`,
    { headers }
  );

  if (!listRes.ok) {
    throw new Error(`videos query failed: ${listRes.status} ${await listRes.text()}`);
  }

  const videos = await listRes.json();
  steps.push(`queried videos (${videos.length} found)`);

  if (videos.length > 0) {
    const video = videos[0];
    const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${video.storage_path}`;

    const videoRes = await fetch(storageUrl, {
      headers: { Range: 'bytes=0-524287' },
    });

    if (!videoRes.ok && videoRes.status !== 206) {
      throw new Error(`storage fetch failed: ${videoRes.status} ${await videoRes.text()}`);
    }

    steps.push(`streamed start of "${video.title}" (${videoRes.status})`);
  }

  const siteRes = await fetch(SITE_URL, {
    headers: { 'User-Agent': 'Freevid-Keepalive/1.0' },
  });

  if (!siteRes.ok) {
    throw new Error(`site fetch failed: ${siteRes.status}`);
  }

  steps.push('pinged GitHub Pages site');

  return steps.join('; ');
}

export default {
  async scheduled(_event, env, _ctx) {
    const result = await keepAlive(env);
    console.log(`keepalive ok: ${result}`);
  },

  async fetch(_request, env) {
    try {
      const result = await keepAlive(env);
      return new Response(`OK: ${result}\n`, {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (err) {
      return new Response(`Error: ${err.message}\n`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
};
