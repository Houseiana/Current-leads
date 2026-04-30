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
    throw err;
  }
  return data;
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

  const showToast = (message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  };

  const handleAddFresh = async (data) => {
    try {
      const { lead } = await jsonFetch("/api/fresh-leads", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setFreshLeads((prev) => [lead, ...prev]);
      showToast(t.successFreshAdded);
    } catch (err) {
      showToast(err.message || t.networkError);
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
      showToast(err.message || t.networkError);
    }
  };

  const handleDeleteFresh = async (id) => {
    try {
      await jsonFetch(`/api/fresh-leads/${id}`, { method: "DELETE" });
      setFreshLeads((prev) => prev.filter((l) => l.id !== id));
      showToast(t.successDeleted);
    } catch (err) {
      showToast(err.message || t.networkError);
    }
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
      showToast(err.message || t.networkError);
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
      showToast(err.message || t.networkError);
    }
  };

  const handleDeleteContacted = async (id) => {
    try {
      await jsonFetch(`/api/contacted-leads/${id}`, { method: "DELETE" });
      setContactedLeads((prev) => prev.filter((l) => l.id !== id));
      showToast(t.successDeleted);
    } catch (err) {
      showToast(err.message || t.networkError);
    }
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
      showToast(err.message || t.networkError);
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

      {toast && <Toast key={toast.id} message={toast.message} />}
    </div>
  );
}
