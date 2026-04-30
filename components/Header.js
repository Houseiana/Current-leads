"use client";

import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ t, language, onLanguageChange, user }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <span className="brand-logo">H</span>
          <span>{t.appTitle}</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {user && (
            <div className="user-chip">
              <span className="user-chip-role">{user.role}</span>
              <span className="user-chip-name">{user.username}</span>
            </div>
          )}
          <LanguageSwitcher language={language} onChange={onLanguageChange} />
          {user && (
            <button type="button" className="btn" onClick={handleLogout}>
              {t.logout}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
