import { useEffect, useState } from 'react';
import { getSessionId } from '../lib/session';
import { isConfigured, supabase } from '../lib/supabase';

export default function ReactionButtons({ videoId, likeCount, dislikeCount, onUpdate }) {
  const [currentReaction, setCurrentReaction] = useState(null);
  const [likes, setLikes] = useState(likeCount);
  const [dislikes, setDislikes] = useState(dislikeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(likeCount);
    setDislikes(dislikeCount);
  }, [likeCount, dislikeCount]);

  useEffect(() => {
    if (!isConfigured) return;

    async function loadReaction() {
      const sessionId = getSessionId();
      const { data } = await supabase
        .from('reactions')
        .select('type')
        .eq('video_id', videoId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (data) {
        setCurrentReaction(data.type);
      }
    }

    loadReaction();
  }, [videoId]);

  async function handleReaction(type) {
    if (!isConfigured || loading) return;

    setLoading(true);
    const sessionId = getSessionId();

    if (currentReaction === type) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('reactions').upsert(
      { video_id: videoId, session_id: sessionId, type },
      { onConflict: 'video_id,session_id' }
    );

    if (!error) {
      setCurrentReaction(type);
      if (onUpdate) onUpdate();
    }

    setLoading(false);
  }

  return (
    <div className="reactions">
      <button
        type="button"
        className={`reaction-btn ${currentReaction === 'like' ? 'active-like' : ''}`}
        onClick={() => handleReaction('like')}
        disabled={loading}
      >
        👍 {likes}
      </button>
      <button
        type="button"
        className={`reaction-btn ${currentReaction === 'dislike' ? 'active-dislike' : ''}`}
        onClick={() => handleReaction('dislike')}
        disabled={loading}
      >
        👎 {dislikes}
      </button>
    </div>
  );
}
