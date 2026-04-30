"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginChooser() {
  const [language, setLanguage] = useState("en");

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

  const onLanguageChange = (lang) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="brand">
          <span className="brand-logo">D</span>
          <span>{t.appTitle}</span>
        </div>
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
      </div>

      <h1 className="login-title">{t.signIn}</h1>
      <p className="login-sub">{t.selectRolePrompt}</p>

      <div className="role-grid">
        <Link href="/login/admin" className="role-card role-admin">
          <span className="role-icon">A</span>
          <span className="role-name">{t.adminSignIn}</span>
          <span className="role-desc">{t.adminSignInSub}</span>
        </Link>
        <Link href="/login/sales" className="role-card role-sales">
          <span className="role-icon">S</span>
          <span className="role-name">{t.salesSignIn}</span>
          <span className="role-desc">{t.salesSignInSub}</span>
        </Link>
      </div>
    </div>
  );
}
