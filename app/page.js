"use client";

import { useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import { loadLanguage, saveLanguage } from "@/lib/storage";
import Header from "@/components/Header";
import GlobalPhoneSearch from "@/components/GlobalPhoneSearch";
import FreshLeadsSection from "@/components/FreshLeadsSection";
import ContactedLeadsSection from "@/components/ContactedLeadsSection";
import ConvertFreshLeadModal from "@/components/ConvertFreshLeadModal";
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
  if (err?.code === "PHONE_EXISTS_IN_CONTACTED") {
    if (err.existing?.salesName && err.existing?.status) {
      return t.errorPhoneInContactedWith
        .replace("{sales}", err.existing.salesName)
        .replace("{status}", err.existing.status);
    }
    return t.errorPhoneInContacted;
  }
  return err?.message || t.networkError;
}

export default function HomePage() {
  const [language, setLanguage] = useState("en");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("fresh");
  const [freshLeads, setFreshLeads] = useState([]);
  const [contactedLeads, setContactedLeads] = useState([]);
  const [convertingLead, setConvertingLead] = useState(null);
  const [toast, setToast] = useState(null);

  const t = useMemo(() => translations[language] || translations.en, [language]);
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

  const loadAll = async () => {
    try {
      const [me, fresh, contacted] = await Promise.all([
        jsonFetch("/api/auth/me"),
        jsonFetch("/api/fresh-leads"),
        jsonFetch("/api/contacted-leads"),
      ]);
      setUser(me.user);
      setFreshLeads(fresh.leads || []);
      setContactedLeads(contacted.leads || []);
    } catch {
      // middleware will redirect to /login on auth failure
    }
  };

  useEffect(() => {
    loadAll();
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
      const { lead } = await jsonFetch("/api/fresh-leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setFreshLeads((prev) => [lead, ...prev]);
      showToast(t.successFreshAdded);
    } catch (err) {
      showError(err);
    }
  };

  const handleUpdateFresh = async (id, data) => {
    try {
      const { lead } = await jsonFetch(`/api/fresh-leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setFreshLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
      showToast(t.successUpdated);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteFresh = async (id, password) => {
    await jsonFetch(`/api/fresh-leads/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    setFreshLeads((prev) => prev.filter((l) => l.id !== id));
    showToast(t.successDeleted);
  };

  const handleAddContacted = async (data) => {
    try {
      const { lead } = await jsonFetch("/api/contacted-leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setContactedLeads((prev) => [lead, ...prev]);
      showToast(t.successContactedAdded);
    } catch (err) {
      showError(err);
    }
  };

  const handleUpdateContacted = async (id, data) => {
    try {
      const { lead } = await jsonFetch(`/api/contacted-leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setContactedLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
      showToast(t.successUpdated);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteContacted = async (id, password) => {
    await jsonFetch(`/api/contacted-leads/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    setContactedLeads((prev) => prev.filter((l) => l.id !== id));
    showToast(t.successDeleted);
  };

  const handleConvertConfirm = async (extraData) => {
    if (!convertingLead) return;
    try {
      const { lead } = await jsonFetch(
        `/api/fresh-leads/${convertingLead.id}/convert`,
        { method: "POST", body: JSON.stringify(extraData) }
      );
      setFreshLeads((prev) => prev.filter((l) => l.id !== convertingLead.id));
      setContactedLeads((prev) => [lead, ...prev]);
      setConvertingLead(null);
      setActiveTab("contacted");
      showToast(t.successConverted);
    } catch (err) {
      showError(err);
    }
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
        <GlobalPhoneSearch t={t} language={language} />

        <div className="tabs" role="tablist">
          <button
            type="button"
            className={`tab ${activeTab === "fresh" ? "active" : ""}`}
            onClick={() => setActiveTab("fresh")}
          >
            {t.freshLeads}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "contacted" ? "active" : ""}`}
            onClick={() => setActiveTab("contacted")}
          >
            {t.contactedLeads}
          </button>
        </div>

        {activeTab === "fresh" ? (
          <FreshLeadsSection
            t={t}
            language={language}
            leads={freshLeads}
            onAdd={handleAddFresh}
            onUpdate={handleUpdateFresh}
            onDelete={handleDeleteFresh}
            onConvert={(lead) => setConvertingLead(lead)}
          />
        ) : (
          <ContactedLeadsSection
            t={t}
            language={language}
            leads={contactedLeads}
            onAdd={handleAddContacted}
            onUpdate={handleUpdateContacted}
            onDelete={handleDeleteContacted}
          />
        )}
      </main>

      {convertingLead && (
        <ConvertFreshLeadModal
          t={t}
          lead={convertingLead}
          onConfirm={handleConvertConfirm}
          onCancel={() => setConvertingLead(null)}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
        />
      )}
    </div>
  );
}
