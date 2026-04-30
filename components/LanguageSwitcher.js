"use client";

export default function LanguageSwitcher({ language, onChange }) {
  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${language === "ar" ? "active" : ""}`}
        onClick={() => onChange("ar")}
      >
        AR
      </button>
    </div>
  );
}
