"use client";

import { useEffect, useMemo, useState } from "react";
import { translations } from "@/lib/translations";
import {
  STORAGE_KEYS,
  loadLanguage,
  loadList,
  saveLanguage,
  saveList,
} from "@/lib/storage";
import { nowISO, uid } from "@/lib/utils";
import Header from "@/components/Header";
import GlobalPhoneSearch from "@/components/GlobalPhoneSearch";
import FreshLeadsSection from "@/components/FreshLeadsSection";
import ContactedLeadsSection from "@/components/ContactedLeadsSection";
import ConvertFreshLeadModal from "@/components/ConvertFreshLeadModal";
import Toast from "@/components/Toast";

export default function HomePage() {
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("fresh");
  const [freshLeads, setFreshLeads] = useState([]);
  const [contactedLeads, setContactedLeads] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [toast, setToast] = useState(null);

  const t = useMemo(() => translations[language] || translations.en, [language]);
  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    setLanguage(loadLanguage());
    setFreshLeads(loadList(STORAGE_KEYS.fresh));
    setContactedLeads(loadList(STORAGE_KEYS.contacted));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  useEffect(() => {
    if (hydrated) saveList(STORAGE_KEYS.fresh, freshLeads);
  }, [freshLeads, hydrated]);

  useEffect(() => {
    if (hydrated) saveList(STORAGE_KEYS.contacted, contactedLeads);
  }, [contactedLeads, hydrated]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    saveLanguage(lang);
  };

  const showToast = (message) => {
    setToast({ message, id: Date.now() });
    setTimeout(() => setToast(null), 2800);
  };

  const handleAddFresh = (data) => {
    const lead = {
      id: uid(),
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setFreshLeads((prev) => [lead, ...prev]);
    showToast(t.successFreshAdded);
  };

  const handleUpdateFresh = (id, data) => {
    setFreshLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updatedAt: nowISO() } : l))
    );
    showToast(t.successUpdated);
  };

  const handleDeleteFresh = (id) => {
    setFreshLeads((prev) => prev.filter((l) => l.id !== id));
    showToast(t.successDeleted);
  };

  const handleAddContacted = (data) => {
    const lead = {
      id: uid(),
      ...data,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      contactedAt: nowISO(),
    };
    setContactedLeads((prev) => [lead, ...prev]);
    showToast(t.successContactedAdded);
  };

  const handleUpdateContacted = (id, data) => {
    setContactedLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updatedAt: nowISO() } : l))
    );
    showToast(t.successUpdated);
  };

  const handleDeleteContacted = (id) => {
    setContactedLeads((prev) => prev.filter((l) => l.id !== id));
    showToast(t.successDeleted);
  };

  const handleConvertConfirm = (extraData) => {
    if (!convertingLead) return;
    const newContacted = {
      id: uid(),
      name: convertingLead.name,
      phone: convertingLead.phone,
      area: convertingLead.area,
      email: extraData.email || "",
      unit: extraData.unit || "",
      salesName: extraData.salesName || "",
      salesPhoneUsed: extraData.salesPhoneUsed || "",
      salesWhatsAppUsed: extraData.salesWhatsAppUsed || "",
      status: extraData.status || "Called",
      houseianaUnitLink: extraData.houseianaUnitLink || "",
      webLeadSourceLink: convertingLead.leadSourceLink || "",
      createdAt: convertingLead.createdAt || nowISO(),
      updatedAt: nowISO(),
      contactedAt: nowISO(),
    };
    setContactedLeads((prev) => [newContacted, ...prev]);
    setFreshLeads((prev) => prev.filter((l) => l.id !== convertingLead.id));
    setConvertingLead(null);
    setActiveTab("contacted");
    showToast(t.successConverted);
  };

  return (
    <div className="app-shell">
      <Header
        t={t}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <main className="container">
        <GlobalPhoneSearch
          t={t}
          freshLeads={freshLeads}
          contactedLeads={contactedLeads}
        />

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
