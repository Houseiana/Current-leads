"use client";

import Modal from "./Modal";
import { formatDate } from "@/lib/utils";

export default function BlacklistDetailsModal({ t, language, entry, onClose }) {
  if (!entry) return null;
  return (
    <Modal
      title={t.blacklistDetails}
      onClose={onClose}
      footer={
        <button type="button" className="btn" onClick={onClose}>
          {t.close}
        </button>
      }
    >
      <div className="detail-grid">
        <div className="detail-item">
          <div className="label">{t.name}</div>
          <div className="value">{entry.name || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.phone}</div>
          <div className="value">{entry.phone || "-"}</div>
        </div>
        <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
          <div className="label">{t.reason}</div>
          <div className="value">{entry.reason || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.createdAt}</div>
          <div className="value">{formatDate(entry.createdAt, language)}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.updatedAt}</div>
          <div className="value">{formatDate(entry.updatedAt, language)}</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            color: "var(--color-muted)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          {t.notes}
        </div>
        <div className="notes-block">
          {entry.notes ? (
            entry.notes
          ) : (
            <em style={{ color: "var(--color-muted)" }}>{t.noNotes}</em>
          )}
        </div>
      </div>
    </Modal>
  );
}
