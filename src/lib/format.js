// Small formatting helpers used across the dashboard.

// "Good Morning, Sarah" — time-of-day greeting with the user's first name.
export function greeting(fullName) {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const name = firstName(fullName);
  return name ? `${part}, ${name}` : part;
}

// Drop a leading title (Dr., Mr, Mrs...) and return the first given name.
export function firstName(fullName) {
  if (!fullName) return "";
  const titles = new Set(["dr", "dr.", "mr", "mr.", "mrs", "mrs.", "ms", "ms."]);
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.toLowerCase();
  return titles.has(first) ? parts[1] ?? "" : parts[0];
}

// Initials for an avatar fallback, e.g. "Dr. Sarah Jenkins" -> "SJ".
export function initials(name) {
  if (!name) return "?";
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => !/^(dr|mr|mrs|ms)\.?$/i.test(p));
  const source = parts.length ? parts : name.trim().split(/\s+/);
  return source
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// "10 mins ago", "1 hour ago", "2 days ago".
export function timeAgo(iso) {
  if (!iso) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [label, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// "11:30 AM" from a timestamp.
export function timeOfDay(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
