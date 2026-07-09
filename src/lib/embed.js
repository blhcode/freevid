export function getWatchUrl(videoId) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/watch/${videoId}`;
}

export function getEmbedUrl(videoId) {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/embed/${videoId}`;
}

export function getEmbedCode(videoId, { width = 560, height = 315 } = {}) {
  const url = getEmbedUrl(videoId);
  return `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen></iframe>`;
}
