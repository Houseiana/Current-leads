"use client";

import Modal from "./Modal";
import { formatDate } from "@/lib/utils";

export default function FreshLeadDetailsModal({ t, language, lead, onClose }) {
  if (!lead) return null;
  return (
    <Modal
      title={t.freshLeadDetails}
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
          <div className="value">{lead.name || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.phone}</div>
          <div className="value">{lead.phone || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.area}</div>
          <div className="value">{lead.area || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.projectName}</div>
          <div className="value">{lead.projectName || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.leadSource}</div>
          <div className="value">{lead.leadSource || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.leadSourceLink}</div>
          <div className="value">
            {lead.leadSourceLink ? (
              <a href={lead.leadSourceLink} target="_blank" rel="noreferrer">
                {lead.leadSourceLink}
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className="detail-item">
          <div className="label">{t.createdAt}</div>
          <div className="value">{formatDate(lead.createdAt, language)}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.updatedAt}</div>
          <div className="value">{formatDate(lead.updatedAt, language)}</div>
        </div>
      </div>
    </Modal>
  );
}
