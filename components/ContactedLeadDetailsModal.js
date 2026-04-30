"use client";

import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";

export default function ContactedLeadDetailsModal({
  t,
  language,
  lead,
  onClose,
}) {
  if (!lead) return null;
  return (
    <Modal
      title={t.contactedLeadDetails}
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
          <div className="label">{t.email}</div>
          <div className="value">{lead.email || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.area}</div>
          <div className="value">{lead.area || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.unit}</div>
          <div className="value">{lead.unit || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.salesName}</div>
          <div className="value">{lead.salesName || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.salesPhoneUsed}</div>
          <div className="value">{lead.salesPhoneUsed || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.salesWhatsAppUsed}</div>
          <div className="value">{lead.salesWhatsAppUsed || "-"}</div>
        </div>
        <div className="detail-item">
          <div className="label">{t.status}</div>
          <div className="value">
            <StatusBadge status={lead.status} t={t} />
          </div>
        </div>
        <div className="detail-item">
          <div className="label">{t.houseianaUnitLink}</div>
          <div className="value">
            {lead.houseianaUnitLink ? (
              <a href={lead.houseianaUnitLink} target="_blank" rel="noreferrer">
                {lead.houseianaUnitLink}
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className="detail-item">
          <div className="label">{t.webLeadSourceLink}</div>
          <div className="value">
            {lead.webLeadSourceLink ? (
              <a href={lead.webLeadSourceLink} target="_blank" rel="noreferrer">
                {lead.webLeadSourceLink}
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
        <div className="detail-item">
          <div className="label">{t.contactedAt}</div>
          <div className="value">{formatDate(lead.contactedAt, language)}</div>
        </div>
      </div>
    </Modal>
  );
}
