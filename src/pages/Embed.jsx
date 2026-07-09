import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getVideoPublicUrl, isConfigured, supabase } from '../lib/supabase';
import { getWatchUrl } from '../lib/embed';

export default function Embed() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideo = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('videos')
      .select('id, title, storage_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else if (!data) {
      setError('Video not found.');
    } else {
      setVideo(data);
    }
  }, [id]);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      await loadVideo();
      setLoading(false);
    }

    load();
  }, [loadVideo]);

  if (!isConfigured || loading) {
    return <div className="embed-page embed-loading" />;
  }

  if (error || !video) {
    return (
      <div className="embed-page embed-error">
        <p>{error ?? 'Video not found.'}</p>
        <Link to="/">Watch on Freevid</Link>
      </div>
    );
  }

  const videoUrl = getVideoPublicUrl(video.storage_path);

  return (
    <div className="embed-page">
      <video
        className="embed-player"
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        title={video.title}
      />
      <a className="embed-brand" href={getWatchUrl(video.id)} target="_blank" rel="noopener noreferrer">
        Watch on Freevid
      </a>
    </div>
  );
}
