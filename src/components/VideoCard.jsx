import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video.id}`} className="video-card">
      <div className="video-card-thumb" aria-hidden="true">
        ▶
      </div>
      <div className="video-card-body">
        <h3 className="video-card-title">{video.title}</h3>
        <p className="video-card-meta">{video.uploader_name}</p>
        <p className="video-card-stats">
          {video.like_count} likes · {video.dislike_count} dislikes
        </p>
      </div>
    </Link>
  );
}
