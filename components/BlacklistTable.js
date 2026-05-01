"use client";

import { formatDate } from "@/lib/utils";

export default function BlacklistTable({
  t,
  language,
  entries,
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
            <th>{t.reason}</th>
            <th>{t.createdAt}</th>
            <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr className="empty-row">
              <td colSpan={5}>{t.noLeads}</td>
            </tr>
          )}
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td data-label={t.name}>
                <span
                  className="badge phoneoff"
                  style={{ marginInlineEnd: 6 }}
                >
                  {t.blacklistedBadge}
                </span>
                {entry.name || "-"}
              </td>
              <td data-label={t.phone}>{entry.phone}</td>
              <td data-label={t.reason}>{entry.reason || "-"}</td>
              <td data-label={t.createdAt}>
                {formatDate(entry.createdAt, language)}
              </td>
              <td data-label={t.actions}>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onView(entry)}
                  >
                    {t.view}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onEdit(entry)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(entry)}
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
