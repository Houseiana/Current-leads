"use client";

import { useState } from "react";
import Modal from "./Modal";
import {
  CONTRACT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/translations";
import { isValidEmail } from "@/lib/utils";

const EMPTY = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  nationalId: "",
  birthDate: "",
  maritalStatus: "",
  childrenCount: "",
  education: "",
  previousExperience: "",
  workPhone: "",
  emergencyPhone: "",
  jobTitle: "",
  department: "",
  employmentType: "",
  contractType: "",
  hireDate: "",
  workLocation: "",
  directManager: "",
  status: "Active",
  monthlySalary: "",
  paymentMethod: "",
  bankAccount: "",
};

function dateOnly(value) {
  if (!value) return "";
  if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function EmployeeForm({ t, initial, onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(initial || {}),
    birthDate: dateOnly(initial?.birthDate),
    hireDate: dateOnly(initial?.hireDate),
  }));
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = t.requiredField;
    if (!form.phone.trim()) e.phone = t.requiredField;
    if (form.email && !isValidEmail(form.email)) e.email = t.invalidEmail;
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
      const payload = { ...form };
      if (isEdit) payload.password = password;
      await onSubmit(payload);
    } catch (err) {
      if (err?.code === "WRONG_PASSWORD" || err?.status === 401) {
        setSubmitError(t.wrongDeletePassword);
      } else {
        setSubmitError(err?.message || t.networkError);
      }
      setSubmitting(false);
    }
  };

  const sel = (label, key, options, placeholder) => (
    <div className="field">
      <label>{label}</label>
      <select
        className="select"
        value={form[key]}
        onChange={(e) => setField(key, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t[o.labelKey] || o.value}
          </option>
        ))}
      </select>
    </div>
  );

  const txt = (label, key, opts = {}) => (
    <div className="field">
      <label>
        {label}
        {opts.required ? " *" : ""}
      </label>
      <input
        className="input"
        type={opts.type || "text"}
        inputMode={opts.inputMode}
        placeholder={opts.placeholder}
        value={form[key] || ""}
        onChange={(e) => setField(key, e.target.value)}
      />
      {errors[key] && <span className="error">{errors[key]}</span>}
    </div>
  );

  return (
    <Modal
      title={isEdit ? t.edit : t.addEmployee}
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
        <div className="form-section-title">{t.sectionPersonal}</div>
        {txt(t.fullName, "fullName", { required: true })}
        {txt(t.personalPhone || t.phone, "phone", { type: "tel", required: true })}
        {txt(t.email, "email", { type: "email" })}
        {txt(t.address, "address")}
        {txt(t.nationalId, "nationalId", { inputMode: "numeric" })}
        {txt(t.birthDate, "birthDate", { type: "date" })}
        {sel(t.maritalStatus, "maritalStatus", MARITAL_STATUS_OPTIONS, t.selectMaritalStatus)}
        {txt(t.childrenCount, "childrenCount", { type: "number", inputMode: "numeric" })}

        <div className="form-section-title">{t.sectionEducation}</div>
        {txt(t.education, "education")}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>{t.previousExperience}</label>
          <textarea
            className="textarea"
            rows={3}
            value={form.previousExperience || ""}
            onChange={(e) => setField("previousExperience", e.target.value)}
          />
        </div>

        <div className="form-section-title">{t.sectionContact}</div>
        {txt(t.workPhone, "workPhone", { type: "tel" })}
        {txt(t.emergencyPhone, "emergencyPhone", { type: "tel" })}

        <div className="form-section-title">{t.sectionWork}</div>
        {txt(t.jobTitle, "jobTitle")}
        {txt(t.department, "department")}
        {sel(t.employmentType, "employmentType", EMPLOYMENT_TYPE_OPTIONS, t.selectEmploymentType)}
        {sel(t.contractType, "contractType", CONTRACT_TYPE_OPTIONS, t.selectContractType)}
        {txt(t.hireDate, "hireDate", { type: "date" })}
        {txt(t.workLocation, "workLocation")}
        {txt(t.directManager, "directManager")}
        {sel(t.employeeStatus, "status", EMPLOYEE_STATUS_OPTIONS, t.selectEmployeeStatus)}

        <div className="form-section-title">{t.sectionPayroll}</div>
        {txt(t.monthlySalary, "monthlySalary", { type: "number", inputMode: "decimal" })}
        {sel(t.paymentMethod, "paymentMethod", PAYMENT_METHOD_OPTIONS, t.selectPaymentMethod)}
        {txt(t.bankAccount, "bankAccount")}

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
