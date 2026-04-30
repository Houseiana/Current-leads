"use client";

import { useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import Header from "@/components/Header";
import GlobalPhoneSearch from "@/components/GlobalPhoneSearch";

export default function SalesPage() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);

  const t = useMemo(
    () => translations[language] || translations.en,
    [language]
  );
  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    setLanguage(loadLanguage());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  return (
    <div className="app-shell">
      <Header
        t={t}
        language={language}
        onLanguageChange={handleLanguageChange}
        user={user}
      />
      <main className="container">
        <div className="panel" style={{ borderColor: "var(--color-accent)" }}>
          <h2 className="panel-title" style={{ marginBottom: 4 }}>
            {t.salesPortal}
          </h2>
          <p style={{ color: "var(--color-muted)", margin: 0 }}>
            {t.salesPortalIntro}
          </p>
        </div>
        <GlobalPhoneSearch t={t} language={language} salesMode />
      </main>
    </div>
  );
}
