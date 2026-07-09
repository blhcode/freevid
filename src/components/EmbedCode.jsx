import { useState } from 'react';
import { getEmbedCode, getEmbedUrl } from '../lib/embed';

export default function EmbedCode({ videoId }) {
  const [copied, setCopied] = useState(null);
  const embedUrl = getEmbedUrl(videoId);
  const embedCode = getEmbedCode(videoId);

  async function copy(text, label) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="embed-section">
      <h2>Embed on your site</h2>
      <p className="embed-hint">Copy the iframe code and paste it into any webpage.</p>

      <div className="embed-field">
        <label htmlFor="embed-url">Embed URL</label>
        <div className="embed-row">
          <input id="embed-url" type="text" readOnly value={embedUrl} />
          <button type="button" className="btn btn-secondary" onClick={() => copy(embedUrl, 'url')}>
            {copied === 'url' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="embed-field">
        <label htmlFor="embed-code">Iframe code</label>
        <div className="embed-row embed-row-stack">
          <textarea id="embed-code" readOnly rows={3} value={embedCode} />
          <button type="button" className="btn btn-secondary" onClick={() => copy(embedCode, 'code')}>
            {copied === 'code' ? 'Copied!' : 'Copy code'}
          </button>
        </div>
      </div>
    </section>
  );
}
