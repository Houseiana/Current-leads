const LANGUAGE_KEY = "app_language";

export function loadLanguage() {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(LANGUAGE_KEY) || "en";
}

export function saveLanguage(lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANGUAGE_KEY, lang);
}
