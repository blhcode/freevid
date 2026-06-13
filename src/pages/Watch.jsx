import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommentList from '../components/CommentList';
import ReactionButtons from '../components/ReactionButtons';
import { getVideoPublicUrl, isConfigured, supabase } from '../lib/supabase';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVideo = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('videos')
      .select('*')
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

  const loadComments = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('id, author_name, body, created_at')
      .eq('video_id', id)
      .order('created_at', { ascending: false });

    if (!fetchError) {
      setComments(data ?? []);
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
      await Promise.all([loadVideo(), loadComments()]);
      setLoading(false);
    }

    load();
  }, [loadVideo, loadComments]);

  async function handleReactionUpdate() {
    await loadVideo();
  }

  async function handleCommentAdded() {
    await loadComments();
  }

  if (!isConfigured) {
    return (
      <div className="info-box">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add
        your project URL and anon key.
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading video…</div>;
  }

  if (error || !video) {
    return (
      <div className="empty-state">
        <p>{error ?? 'Video not found.'}</p>
        <Link to="/" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    );
  }

  const videoUrl = getVideoPublicUrl(video.storage_path);

  return (
    <div className="watch-layout">
      <video
        className="video-player"
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
      />

      <h1 className="watch-title">{video.title}</h1>
      <p className="watch-meta">
        {video.uploader_name} · {formatDate(video.created_at)}
      </p>

      {video.description && (
        <p className="watch-description">{video.description}</p>
      )}

      <ReactionButtons
        videoId={video.id}
        likeCount={video.like_count}
        dislikeCount={video.dislike_count}
        onUpdate={handleReactionUpdate}
      />

      <CommentList
        videoId={video.id}
        comments={comments}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}
