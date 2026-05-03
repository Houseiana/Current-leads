"use client";

import { useState } from "react";
import Modal from "./Modal";
import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
  isValidEmail,
  isValidUrl,
} from "@/lib/utils";
import {
  LEAD_TYPE_OPTIONS,
  SALES_NAMES,
  STATUS_OPTIONS,
} from "@/lib/translations";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  area: "",
  unit: "",
  salesName: "",
  salesPhoneUsed: "",
  salesWhatsAppUsed: "",
  status: "Called",
  unitLink: "",
  webLeadSourceLink: "",
  leadType: "",
  notes: "",
  callAt: "",
};

export default function ContactedLeadForm({
  t,
  initial,
  onSubmit,
  onCancel,
  hideSalesName = false,
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(initial || {}),
    callAt: isoToDatetimeLocal(initial?.callAt),
  }));
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t.requiredField;
    if (!form.phone.trim()) e.phone = t.requiredField;
    if (!hideSalesName && !form.salesName.trim()) e.salesName = t.requiredField;
    if (!form.status) e.status = t.requiredField;
    if (form.email && !isValidEmail(form.email)) e.email = t.invalidEmail;
    if (form.unitLink && !isValidUrl(form.unitLink))
      e.unitLink = t.invalidUrl;
    if (form.webLeadSourceLink && !isValidUrl(form.webLeadSourceLink))
      e.webLeadSourceLink = t.invalidUrl;
    if (isEdit && !password) e.password = t.requiredField;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    const trimmed = {};
    Object.keys(form).forEach((k) => {
      trimmed[k] = typeof form[k] === "string" ? form[k].trim() : form[k];
    });
    trimmed.callAt = datetimeLocalToIso(form.callAt);
    if (isEdit) trimmed.password = password;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      if (err?.code === "WRONG_PASSWORD" || err?.status === 401) {
        setSubmitError(t.wrongDeletePassword);
      } else {
        setSubmitError(err?.message || t.networkError);
      }
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={initial ? t.edit : t.addContactedLead}
      onClose={submitting ? undefined : onCancel}
      footer={
        <>
          <button
            type="button"
            className="btn"
            onClick={onCancel}
            disabled={submitting}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t.loading || "..." : t.save}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <label>{t.name} *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="field">
          <label>{t.phone} *</label>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>
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
          <label>{t.area}</label>
          <input
            className="input"
            value={form.area}
            onChange={(e) => setField("area", e.target.value)}
          />
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
          <label>{t.webLeadSourceLink}</label>
          <input
            className="input"
            type="url"
            placeholder="https://..."
            value={form.webLeadSourceLink}
            onChange={(e) => setField("webLeadSourceLink", e.target.value)}
          />
          {errors.webLeadSourceLink && (
            <span className="error">{errors.webLeadSourceLink}</span>
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
        {isEdit && (
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>{t.editPasswordLabel} *</label>
            <input
              className="input"
              type="password"
              placeholder={t.editPasswordPrompt}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>
        )}
        {submitError && (
          <div
            className="login-error"
            style={{ gridColumn: "1 / -1", marginTop: 4 }}
          >
            {submitError}
          </div>
        )}
      </form>
    </Modal>
  );
}
