"use client";

import StatusBadge from "./StatusBadge";
import { leadTypeLabel } from "@/lib/translations";

export default function ContactedLeadTable({
  t,
  leads,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-wrap responsive">
      <table className="table">
        <thead>
          <tr>
            <th>{t.name}</th>
            <th>{t.phone}</th>
            <th>{t.email}</th>
            <th>{t.area}</th>
            <th>{t.unit}</th>
            <th>{t.salesName}</th>
            <th>{t.salesPhoneUsed}</th>
            <th>{t.salesWhatsAppUsed}</th>
            <th>{t.status}</th>
            <th>{t.leadType}</th>
            <th>{t.unitLink}</th>
            <th>{t.webLeadSourceLink}</th>
            <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr className="empty-row">
              <td colSpan={13}>{t.noLeads}</td>
            </tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label={t.name}>
                <span
                  className="badge contacted"
                  style={{ marginInlineEnd: 6 }}
                >
                  {t.contactedLeadBadge}
                </span>
                {lead.name}
              </td>
              <td data-label={t.phone}>{lead.phone}</td>
              <td data-label={t.email}>{lead.email || "-"}</td>
              <td data-label={t.area}>{lead.area || "-"}</td>
              <td data-label={t.unit}>{lead.unit || "-"}</td>
              <td data-label={t.salesName}>{lead.salesName || "-"}</td>
              <td data-label={t.salesPhoneUsed}>
                {lead.salesPhoneUsed || "-"}
              </td>
              <td data-label={t.salesWhatsAppUsed}>
                {lead.salesWhatsAppUsed || "-"}
              </td>
              <td data-label={t.status}>
                <StatusBadge status={lead.status} t={t} />
              </td>
              <td data-label={t.leadType}>{leadTypeLabel(lead.leadType, t)}</td>
              <td data-label={t.unitLink}>
                {lead.unitLink ? (
                  <a
                    href={lead.unitLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td data-label={t.webLeadSourceLink}>
                {lead.webLeadSourceLink ? (
                  <a
                    href={lead.webLeadSourceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td data-label={t.actions}>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onView(lead)}
                  >
                    {t.view}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onEdit(lead)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(lead)}
                  >
                    {t.delete}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
