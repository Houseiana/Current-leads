"use client";

import { useState } from "react";
import Modal from "./Modal";
import { isValidUrl } from "@/lib/utils";
import { LEAD_TYPE_OPTIONS } from "@/lib/translations";

const EMPTY = {
  name: "",
  phone: "",
  area: "",
  projectName: "",
  leadSource: "",
  leadSourceLink: "",
  leadType: "",
  owner: "",
};

export default function FreshLeadForm({
  t,
  initial,
  onSubmit,
  onCancel,
  salesUsers,
}) {
  const isEdit = !!initial;
  const showAssign = Array.isArray(salesUsers);
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t.requiredField;
    if (!form.phone.trim()) e.phone = t.requiredField;
    if (!form.area.trim()) e.area = t.requiredField;
    if (!form.projectName.trim()) e.projectName = t.requiredField;
    if (!form.leadSource.trim()) e.leadSource = t.requiredField;
    if (form.leadSourceLink && !isValidUrl(form.leadSourceLink))
      e.leadSourceLink = t.invalidUrl;
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
        area: form.area.trim(),
        projectName: form.projectName.trim(),
        leadSource: form.leadSource.trim(),
        leadSourceLink: form.leadSourceLink.trim(),
        leadType: form.leadType,
        ...(showAssign ? { owner: form.owner } : {}),
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
      title={initial ? t.edit : t.addFreshLead}
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
          <label>{t.area} *</label>
          <input
            className="input"
            value={form.area}
            onChange={(e) => setField("area", e.target.value)}
          />
          {errors.area && <span className="error">{errors.area}</span>}
        </div>
        <div className="field">
          <label>{t.projectName} *</label>
          <input
            className="input"
            value={form.projectName}
            onChange={(e) => setField("projectName", e.target.value)}
          />
          {errors.projectName && (
            <span className="error">{errors.projectName}</span>
          )}
        </div>
        <div className="field">
          <label>{t.leadSource} *</label>
          <input
            className="input"
            value={form.leadSource}
            onChange={(e) => setField("leadSource", e.target.value)}
          />
          {errors.leadSource && (
            <span className="error">{errors.leadSource}</span>
          )}
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
        {showAssign && (
          <div className="field">
            <label>{t.assignTo}</label>
            <select
              className="select"
              value={form.owner || ""}
              onChange={(e) => setField("owner", e.target.value)}
            >
              <option value="">{t.unassigned}</option>
              {salesUsers.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.displayName}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.leadSourceLink}</label>
          <input
            className="input"
            type="url"
            placeholder="https://..."
            value={form.leadSourceLink}
            onChange={(e) => setField("leadSourceLink", e.target.value)}
          />
          {errors.leadSourceLink && (
            <span className="error">{errors.leadSourceLink}</span>
          )}
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
