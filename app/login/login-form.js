"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { translations } from "@/lib/translations";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginForm() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t.invalidCredentials);
        setLoading(false);
        return;
      }
      router.replace(data.role === "admin" ? "/" : "/sales");
      router.refresh();
    } catch {
      setError(t.invalidCredentials);
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="brand">
          <span className="brand-logo">H</span>
          <span>{t.appTitle}</span>
        </div>
        <LanguageSwitcher language={language} onChange={onLanguageChange} />
      </div>
      <h1 className="login-title">{t.signIn}</h1>
      <p className="login-sub">{t.signInSub}</p>

      <form onSubmit={submit} className="login-form">
        <div className="field">
          <label>{t.username}</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>{t.password}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
          disabled={loading}
        >
          {loading ? "..." : t.signIn}
        </button>
      </form>
    </div>
  );
}
