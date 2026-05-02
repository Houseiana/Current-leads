"use client";

import { formatDate, isoToDatetimeLocal } from "@/lib/utils";
import {
  CONTRACT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  optionLabel,
} from "@/lib/translations";

export default function EmployeeTable({
  t,
  language,
  employees,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-wrap responsive">
      <table className="table">
        <thead>
          <tr>
            <th>{t.fullName}</th>
            <th>{t.phone}</th>
            <th>{t.jobTitle}</th>
            <th>{t.department}</th>
            <th>{t.contractType}</th>
            <th>{t.employeeStatus}</th>
            <th>{t.hireDate}</th>
            <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 && (
            <tr className="empty-row">
              <td colSpan={8}>{t.noLeads}</td>
            </tr>
          )}
          {employees.map((e) => (
            <tr key={e.id}>
              <td data-label={t.fullName}>{e.fullName}</td>
              <td data-label={t.phone}>{e.phone}</td>
              <td data-label={t.jobTitle}>{e.jobTitle || "-"}</td>
              <td data-label={t.department}>{e.department || "-"}</td>
              <td data-label={t.contractType}>
                {optionLabel(CONTRACT_TYPE_OPTIONS, e.contractType, t)}
              </td>
              <td data-label={t.employeeStatus}>
                {optionLabel(EMPLOYEE_STATUS_OPTIONS, e.status, t)}
              </td>
              <td data-label={t.hireDate}>
                {e.hireDate ? formatDate(e.hireDate, language).split(",")[0] : "-"}
              </td>
              <td data-label={t.actions}>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onView(e)}
                  >
                    {t.view}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => onEdit(e)}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(e)}
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
