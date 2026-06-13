import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ALLOWED_VIDEO_TYPES,
  isConfigured,
  supabase,
} from '../lib/supabase';

export default function Upload() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isConfigured) {
    return (
      <div className="info-box">
        Supabase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add
        your project URL and anon key.
      </div>
    );
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a video file.');
      return;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError('Only MP4 and WebM videos are allowed.');
      return;
    }

    if (!title.trim() || !uploaderName.trim()) {
      setError('Title and your name are required.');
      return;
    }

    setUploading(true);

    const ext = file.type === 'video/webm' ? 'webm' : 'mp4';
    const videoId = crypto.randomUUID();
    const storagePath = `${videoId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      const msg = uploadError.message.toLowerCase();
      if (msg.includes('maximum allowed size') || msg.includes('file size')) {
        setError(
          'File too large for Supabase Storage. In your Supabase dashboard go to Storage → Settings and set Global file size limit to 50 MB (free plan max). Then open the videos bucket → Edit bucket and turn off "Restrict file size", or run supabase/remove-upload-limit.sql in the SQL Editor.'
        );
      } else {
        setError(uploadError.message);
      }
      setUploading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('videos')
      .insert({
        id: videoId,
        title: title.trim(),
        uploader_name: uploaderName.trim(),
        description: description.trim(),
        storage_path: storagePath,
      })
      .select('id')
      .single();

    if (insertError) {
      await supabase.storage.from('videos').remove([storagePath]);
      setError(insertError.message);
      setUploading(false);
      return;
    }

    navigate(`/watch/${data.id}`);
  }

  return (
    <>
      <h1 className="page-title">Upload a video</h1>
      {error && <div className="error-box">{error}</div>}
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="video-file">Video file</label>
          <input
            id="video-file"
            type="file"
            accept="video/mp4,video/webm,.mp4,.webm"
            onChange={handleFileChange}
            required
          />
          <span className="form-hint">MP4 or WebM</span>
        </div>

        <div className="form-group">
          <label htmlFor="title">Video title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="uploader">Your name</label>
          <input
            id="uploader"
            type="text"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </>
  );
}
