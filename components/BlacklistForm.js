"use client";

import { useState } from "react";
import Modal from "./Modal";

const EMPTY = {
  name: "",
  phone: "",
  reason: "",
  notes: "",
};

export default function BlacklistForm({ t, initial, onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.phone.trim()) e.phone = t.requiredField;
    if (isEdit && !password) e.password = t.requiredField;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        reason: form.reason.trim(),
        notes: form.notes.trim(),
        ...(isEdit ? { password } : {}),
      });
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
      title={initial ? t.edit : t.addBlacklist}
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
          <label>{t.phone} *</label>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            autoFocus={!isEdit}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>
        <div className="field">
          <label>{t.name}</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.reason}</label>
          <input
            className="input"
            placeholder={t.reasonPlaceholder}
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
          />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.notes}</label>
          <textarea
            className="textarea"
            rows={4}
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
