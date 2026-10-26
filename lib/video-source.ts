/** Supported public source URL shapes; no arbitrary URL is forwarded to an iframe. */
export type YouTubeSource = { videoId: string; start: number };
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const WATCH_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const EMBED_HOSTS = new Set(['youtube-nocookie.com', 'www.youtube-nocookie.com']);

function parseTimestamp(value: string): number | null {
  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;
  }
  const units = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!units || !units.slice(1).some((part) => part !== undefined)) return null;
  const seconds = Number(units[1] || 0) * 3600 + Number(units[2] || 0) * 60 + Number(units[3] || 0);
  return Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;
}

/** Unknown hosts, ambiguous IDs and malformed timestamps stay external links. */
export function parseYouTubeSource(value: string): YouTubeSource | null {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!input || input.length > 2048 || /[\s\u0000-\u001f\u007f]/.test(input)) return null;
  let url: URL;
  try { url = new URL(input); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
  let videoId: string | null = null;
  if (WATCH_HOSTS.has(url.hostname)) {
    if (url.pathname === '/watch' && url.searchParams.getAll('v').length === 1) videoId = url.searchParams.get('v');
    else {
      const match = /^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname);
      if (match && !url.searchParams.has('v')) videoId = match[1];
    }
  } else if (url.hostname === 'youtu.be') {
    const match = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname);
    if (match && !url.searchParams.has('v')) videoId = match[1];
  } else if (EMBED_HOSTS.has(url.hostname)) {
    const match = /^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname);
    if (match && !url.searchParams.has('v')) videoId = match[1];
  }
  if (!videoId || !VIDEO_ID.test(videoId)) return null;

  const timestamps: number[] = [];
  // Older shared links may place the timestamp in the fragment rather than the query.
  const fragment = new URLSearchParams(url.hash.slice(1));
  for (const parameters of [url.searchParams, fragment]) {
    for (const key of ['t', 'start']) {
      const values = parameters.getAll(key);
      if (values.length > 1) return null;
      if (values.length === 1) {
        const seconds = parseTimestamp(values[0]);
        if (seconds === null) return null;
        timestamps.push(seconds);
      }
    }
  }
  if (timestamps.some((seconds) => seconds !== timestamps[0])) return null;
  return { videoId, start: timestamps[0] ?? 0 };
}

/** start is seconds from the original video's beginning; never request autoplay. */
export function buildYouTubeEmbedUrl(source: YouTubeSource): string {
  if (!source || typeof source.videoId !== 'string' || !VIDEO_ID.test(source.videoId)) throw new TypeError('Invalid YouTube video identifier.');
  if (typeof source.start !== 'number' || !Number.isSafeInteger(source.start) || source.start < 0) throw new RangeError('Invalid YouTube start time.');
  const parameters = new URLSearchParams({ rel: '0', playsinline: '1', start: String(source.start) });
  return `https://www.youtube-nocookie.com/embed/${source.videoId}?${parameters.toString()}`;
}
