"use client";

import { useState } from "react";
import Modal from "./Modal";
import {
  datetimeLocalToIso,
  isValidEmail,
  isValidUrl,
} from "@/lib/utils";
import {
  LEAD_TYPE_OPTIONS,
  SALES_NAMES,
  STATUS_OPTIONS,
} from "@/lib/translations";

export default function ConvertFreshLeadModal({
  t,
  lead,
  onConfirm,
  onCancel,
  hideSalesName = false,
}) {
  const [form, setForm] = useState({
    email: "",
    unit: "",
    salesName: "",
    salesPhoneUsed: "",
    salesWhatsAppUsed: "",
    status: "Called",
    unitLink: "",
    leadType: lead?.leadType || "",
    notes: "",
    callAt: "",
  });
  const [errors, setErrors] = useState({});

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!hideSalesName && !form.salesName.trim()) e.salesName = t.requiredField;
    if (!form.status) e.status = t.requiredField;
    if (form.email && !isValidEmail(form.email)) e.email = t.invalidEmail;
    if (form.unitLink && !isValidUrl(form.unitLink))
      e.unitLink = t.invalidUrl;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const trimmed = {};
    Object.keys(form).forEach((k) => {
      trimmed[k] = typeof form[k] === "string" ? form[k].trim() : form[k];
    });
    trimmed.callAt = datetimeLocalToIso(form.callAt);
    onConfirm(trimmed);
  };

  return (
    <Modal
      title={t.convertTitle}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            {t.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            {t.transferToContacted}
          </button>
        </>
      }
    >
      <div
        style={{
          background: "var(--color-soft)",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="detail-grid">
          <div className="detail-item">
            <div className="label">{t.name}</div>
            <div className="value">{lead.name}</div>
          </div>
          <div className="detail-item">
            <div className="label">{t.phone}</div>
            <div className="value">{lead.phone}</div>
          </div>
          <div className="detail-item">
            <div className="label">{t.area}</div>
            <div className="value">{lead.area}</div>
          </div>
          <div className="detail-item">
            <div className="label">{t.leadSource}</div>
            <div className="value">{lead.leadSource}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label>{t.email}</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="field">
          <label>{t.unit}</label>
          <input
            className="input"
            value={form.unit}
            onChange={(e) => setField("unit", e.target.value)}
          />
        </div>
        {!hideSalesName && (
          <div className="field">
            <label>{t.salesName} *</label>
            <select
              className="select"
              value={form.salesName}
              onChange={(e) => setField("salesName", e.target.value)}
            >
              <option value="">{t.selectSales}</option>
              {SALES_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {errors.salesName && (
              <span className="error">{errors.salesName}</span>
            )}
          </div>
        )}
        <div className="field">
          <label>{t.salesPhoneUsed}</label>
          <input
            className="input"
            type="tel"
            value={form.salesPhoneUsed}
            onChange={(e) => setField("salesPhoneUsed", e.target.value)}
          />
        </div>
        <div className="field">
          <label>{t.salesWhatsAppUsed}</label>
          <input
            className="input"
            type="tel"
            value={form.salesWhatsAppUsed}
            onChange={(e) => setField("salesWhatsAppUsed", e.target.value)}
          />
        </div>
        <div className="field">
          <label>{t.status} *</label>
          <select
            className="select"
            value={form.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="">{t.selectStatus}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {t[s.labelKey]}
              </option>
            ))}
          </select>
          {errors.status && <span className="error">{errors.status}</span>}
        </div>
        <div className="field">
          <label>{t.leadType}</label>
          <select
            className="select"
            value={form.leadType}
            onChange={(e) => setField("leadType", e.target.value)}
          >
            <option value="">{t.selectLeadType}</option>
            {LEAD_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t[o.labelKey]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>{t.callAt}</label>
          <input
            className="input"
            type="datetime-local"
            value={form.callAt}
            onChange={(e) => setField("callAt", e.target.value)}
          />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.unitLink}</label>
          <input
            className="input"
            type="url"
            placeholder="https://..."
            value={form.unitLink}
            onChange={(e) => setField("unitLink", e.target.value)}
          />
          {errors.unitLink && (
            <span className="error">{errors.unitLink}</span>
          )}
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.notes}</label>
          <textarea
            className="textarea"
            rows={5}
            placeholder={t.notesPlaceholder}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
