"use client";

import { formatDate } from "@/lib/utils";
import { leadTypeLabel } from "@/lib/translations";

export default function FreshLeadTable({
  t,
  language,
  leads,
  onView,
  onEdit,
  onDelete,
  onConvert,
}) {
  return (
    <div className="table-wrap responsive">
      <table className="table">
        <thead>
          <tr>
            <th>{t.name}</th>
            <th>{t.phone}</th>
            <th>{t.area}</th>
            <th>{t.projectName}</th>
            <th>{t.leadSource}</th>
            <th>{t.leadType}</th>
            <th>{t.leadSourceLink}</th>
            <th>{t.createdAt}</th>
            <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {leads.length === 0 && (
            <tr className="empty-row">
              <td colSpan={9}>{t.noLeads}</td>
            </tr>
          )}
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td data-label={t.name}>
                <span className="badge fresh" style={{ marginInlineEnd: 6 }}>
                  {t.freshLeadBadge}
                </span>
                {lead.name}
              </td>
              <td data-label={t.phone}>{lead.phone}</td>
              <td data-label={t.area}>{lead.area}</td>
              <td data-label={t.projectName}>{lead.projectName}</td>
              <td data-label={t.leadSource}>{lead.leadSource}</td>
              <td data-label={t.leadType}>{leadTypeLabel(lead.leadType, t)}</td>
              <td data-label={t.leadSourceLink}>
                {lead.leadSourceLink ? (
                  <a
                    href={lead.leadSourceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    🔗
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td data-label={t.createdAt}>
                {formatDate(lead.createdAt, language)}
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
                    className="btn btn-sm btn-primary"
                    onClick={() => onConvert(lead)}
                    title={t.transferToContacted}
                  >
                    → {t.transferToContacted}
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
