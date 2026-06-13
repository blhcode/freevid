import { useState } from 'react';
import { isConfigured, supabase } from '../lib/supabase';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CommentList({ videoId, comments, onCommentAdded }) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isConfigured) return;

    if (!authorName.trim() || !body.trim()) {
      setError('Name and comment are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('comments').insert({
      video_id: videoId,
      author_name: authorName.trim(),
      body: body.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setBody('');
      if (onCommentAdded) onCommentAdded();
    }

    setSubmitting(false);
  }

  return (
    <section className="comments-section">
      <h2>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>

      {error && <div className="error-box">{error}</div>}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="comment-name">Your name</label>
          <input
            id="comment-name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="comment-body">Add a comment</label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            required
          />
        </div>
        <button type="submit" className="btn btn-secondary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </form>

      <div className="comment-list">
        {comments.map((comment) => (
          <article key={comment.id} className="comment">
            <p className="comment-author">
              {comment.author_name}
              <span className="comment-date">{formatDate(comment.created_at)}</span>
            </p>
            <p className="comment-body">{comment.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
