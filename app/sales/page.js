"use client";

import { useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import { displayName } from "@/lib/utils";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import Header from "@/components/Header";
import GlobalPhoneSearch from "@/components/GlobalPhoneSearch";
import FreshLeadForm from "@/components/FreshLeadForm";
import ContactedLeadForm from "@/components/ContactedLeadForm";
import MyClientsView from "@/components/MyClientsView";
import Toast from "@/components/Toast";

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = res.status;
    err.code = data?.code;
    err.existing = data?.existing;
    throw err;
  }
  return data;
}

function localizeError(err, t) {
  if (err?.code === "PHONE_ALREADY_EXISTS") {
    const e = err.existing || {};
    if (e.location === "blacklist") {
      return (t.errorAlreadyExistsBlacklist || "")
        .replace("{name}", e.name || "-")
        .replace("{reason}", e.reason || "-");
    }
    // For sales, any pre-existing match means "refer to Sara"
    if (e.location === "contacted" || e.location === "fresh") {
      const ownerName = e.owner ? displayName(e.owner) : null;
      if (ownerName) {
        return (t.ownershipOther || "").replace("{owner}", ownerName);
      }
      return t.ownershipNoOwner;
    }
    return t.errorAlreadyExists;
  }
  return err?.message || t.networkError;
}

export default function SalesPage() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home"); // home | myClients
  const [showFreshForm, setShowFreshForm] = useState(false);
  const [showContactedForm, setShowContactedForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const showToast = (message, variant = "success") => {
    setToast({ message, variant, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };
  const showError = (err) => showToast(localizeError(err, t), "error");

  const handleAddFresh = async (data) => {
    try {
      await jsonFetch("/api/fresh-leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast(t.successFreshAdded);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showError(err);
      throw err;
    }
  };

  const handleAddContacted = async (data) => {
    try {
      await jsonFetch("/api/contacted-leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      showToast(t.successContactedAdded);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showError(err);
      throw err;
    }
  };

  const greetingName = user
    ? user.username
      ? displayName(user.username)
      : ""
    : "";

  return (
    <div className="app-shell">
      <Header
        t={t}
        language={language}
        onLanguageChange={handleLanguageChange}
        user={user}
      />
      <main className="container">
        <div className="panel sales-greeting">
          <h2 className="panel-title" style={{ marginBottom: 4 }}>
            {(t.salesGreeting || "Hello {name}").replace(
              "{name}",
              greetingName || ""
            )}
          </h2>
          <p style={{ color: "var(--color-muted)", margin: 0 }}>
            {t.salesGreetingSub}
          </p>

          <div
            className="row-actions"
            style={{ marginTop: 14, gap: 8, flexWrap: "wrap" }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowFreshForm(true)}
            >
              + {t.addNewClient}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setShowContactedForm(true)}
            >
              + {t.addContactedClient}
            </button>
            <button
              type="button"
              className={`btn ${view === "myClients" ? "btn-primary" : ""}`}
              onClick={() =>
                setView(view === "myClients" ? "home" : "myClients")
              }
            >
              👥 {t.myClients}
            </button>
          </div>
        </div>

        {view === "home" && (
          <GlobalPhoneSearch t={t} language={language} salesMode />
        )}

        {view === "myClients" && (
          <MyClientsView key={refreshKey} t={t} language={language} />
        )}
      </main>

      {showFreshForm && (
        <FreshLeadForm
          t={t}
          initial={null}
          onCancel={() => setShowFreshForm(false)}
          onSubmit={async (data) => {
            await handleAddFresh(data);
            setShowFreshForm(false);
          }}
        />
      )}

      {showContactedForm && (
        <ContactedLeadForm
          t={t}
          initial={null}
          hideSalesName
          onCancel={() => setShowContactedForm(false)}
          onSubmit={async (data) => {
            await handleAddContacted(data);
            setShowContactedForm(false);
          }}
        />
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} variant={toast.variant} />
      )}
    </div>
  );
}
