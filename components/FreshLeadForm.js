"use client";

import { useState } from "react";
import Modal from "./Modal";
import { isValidUrl } from "@/lib/utils";

const EMPTY = {
  name: "",
  phone: "",
  area: "",
  projectName: "",
  leadSource: "",
  leadSourceLink: "",
};

export default function FreshLeadForm({ t, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [errors, setErrors] = useState({});

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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      area: form.area.trim(),
      projectName: form.projectName.trim(),
      leadSource: form.leadSource.trim(),
      leadSourceLink: form.leadSourceLink.trim(),
    });
  };

  return (
    <Modal
      title={initial ? t.edit : t.addFreshLead}
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
            {t.save}
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
      </form>
    </Modal>
  );
}
