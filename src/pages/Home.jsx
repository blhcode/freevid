import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isConfigured, supabase } from '../lib/supabase';
import VideoCard from '../components/VideoCard';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    async function loadVideos() {
      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('id, title, uploader_name, like_count, dislike_count, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setVideos(data ?? []);
      }
      setLoading(false);
    }

    loadVideos();
  }, []);

  if (!isConfigured) {
    return (
      <div className="info-box">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add
        your project URL and anon key.
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading videos…</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <p>No videos yet. Be the first to upload!</p>
        <Link to="/upload" className="btn btn-primary">
          Upload a video
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Videos</h1>
      <div className="video-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </>
  );
}
