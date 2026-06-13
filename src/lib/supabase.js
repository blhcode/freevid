import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

export const supabase = isConfigured
  ? createClient(url, key)
  : null;

export function getVideoPublicUrl(storagePath) {
  if (!supabase) return null;
  const { data } = supabase.storage.from('videos').getPublicUrl(storagePath);
  return data.publicUrl;
}

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
