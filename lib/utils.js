export function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export function nowISO() {
  return new Date().toISOString();
}

export function formatDate(iso, locale = "en") {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function isValidUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
}

export function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizePhone(value) {
  if (!value) return "";
  let s = String(value).replace(/[^\d]/g, "");
  if (s.startsWith("00")) s = s.slice(2);
  s = s.replace(/^0+/, "");
  return s;
}

export function phonesMatch(a, b) {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shortA = na.slice(-9);
  const shortB = nb.slice(-9);
  return shortA.length >= 7 && shortA === shortB;
}

export function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isThisWeek(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

// Convert an ISO timestamp from the server to the value format that
// <input type="datetime-local"> expects (YYYY-MM-DDTHH:mm in local time).
export function isoToDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// Convert a datetime-local input value (local time, no zone) back to an
// ISO string (UTC) that Postgres can store as TIMESTAMPTZ.
export function datetimeLocalToIso(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function uniqueValues(list, key) {
  const set = new Set();
  list.forEach((item) => {
    const v = item?.[key];
    if (v) set.add(v);
  });
  return Array.from(set).sort();
}
