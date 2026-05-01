"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function ConfirmDeleteModal({ t, onConfirm, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!password) {
      setError(t.requiredField);
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(password);
      // success: parent will unmount this modal
    } catch (err) {
      if (err?.code === "WRONG_PASSWORD" || err?.status === 401) {
        setError(t.wrongDeletePassword);
      } else {
        setError(err?.message || t.networkError);
      }
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t.confirmDeleteTitle}
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
            className="btn btn-danger"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? t.loading || "..." : t.delete}
          </button>
        </>
      }
    >
      <p style={{ marginTop: 0 }}>{t.confirmDeleteText}</p>
      <p style={{ color: "var(--color-muted)", fontSize: 12, marginTop: -4 }}>
        {t.deletePasswordPrompt}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>{t.deletePasswordLabel}</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
        {error && <div className="login-error" style={{ marginTop: 8 }}>{error}</div>}
      </form>
    </Modal>
  );
}
