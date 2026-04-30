"use client";

import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ t, language, onLanguageChange }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-logo">H</span>
          <span>{t.appTitle}</span>
        </div>
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}
