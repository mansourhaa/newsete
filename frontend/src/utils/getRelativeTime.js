export function getRelativeTime(isoDate) {
  const delta = Math.floor((Date.now() - new Date(isoDate)) / 1000);
  const days  = Math.floor(delta / 86400);
  if (days > 0) return `${days}d ago`;
  const hrs   = Math.floor(delta / 3600);
  if (hrs > 0) return `${hrs}h ago`;
  const mins  = Math.floor(delta / 60);
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}
