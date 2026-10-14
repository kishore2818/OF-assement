/**
 * Formats a raw timestamp (UTC ISO or SQLite string) into the user's localized date and time.
 * Automatically accounts for browser timezone offset (e.g. IST +05:30).
 */
export function formatDateTime(rawDate) {
  if (!rawDate) return 'N/A';
  let iso = String(rawDate).trim();

  // If stored in SQLite format "YYYY-MM-DD HH:MM:SS" without timezone, treat as UTC
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(iso)) {
    iso = iso.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) {
    iso = iso + 'Z';
  }

  const d = new Date(iso);
  if (isNaN(d.getTime())) return rawDate;

  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeParts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(d);

  // Build "10:30:30\u00a0AM" — non-breaking space keeps time+AM/PM on one line
  const hour   = timeParts.find(p => p.type === 'hour')?.value   ?? '';
  const min    = timeParts.find(p => p.type === 'minute')?.value  ?? '';
  const sec    = timeParts.find(p => p.type === 'second')?.value  ?? '';
  const ampm   = timeParts.find(p => p.type === 'dayPeriod')?.value ?? '';
  const timePart = `${hour}:${min}:${sec}\u00a0${ampm}`;

  return `${datePart}, ${timePart}`;
}

/**
 * Returns a human-friendly relative time string (e.g. "Just now", "2m ago", "1h ago").
 */
export function formatTimeAgo(rawDate) {
  if (!rawDate) return '';
  let iso = String(rawDate).trim();

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(iso)) {
    iso = iso.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(iso)) {
    iso = iso + 'Z';
  }

  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));

  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}
