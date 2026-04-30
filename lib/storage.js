export const STORAGE_KEYS = {
  fresh: "houseiana_fresh_leads",
  contacted: "houseiana_contacted_leads",
  language: "houseiana_language",
};

export function loadList(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveList(key, list) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(list));
}

export function loadLanguage() {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEYS.language) || "en";
}

export function saveLanguage(lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.language, lang);
}
