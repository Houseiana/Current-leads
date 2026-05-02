"use client";

import { useState } from "react";
import DashboardCards from "./DashboardCards";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import EmployeeDetailsModal from "./EmployeeDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function EmployeesSection({
  t,
  language,
  employees,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const active = employees.filter((e) => e.status === "Active").length;
  const onLeave = employees.filter((e) => e.status === "On Leave").length;
  const terminated = employees.filter((e) => e.status === "Terminated").length;

  return (
    <div>
      <DashboardCards
        items={[
          { label: t.totalEmployees, value: employees.length, accent: true },
          { label: t.empStatusActive, value: active },
          { label: t.empStatusLeave, value: onLeave },
          { label: t.empStatusTerminated, value: terminated },
        ]}
      />

      <div className="panel">
        <h2 className="panel-title">
          <span>{t.employees}</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t.addEmployee}
          </button>
        </h2>

        <EmployeeTable
          t={t}
          language={language}
          employees={employees}
          onView={(e) => setViewing(e)}
          onEdit={(e) => {
            setEditing(e);
            setShowForm(true);
          }}
          onDelete={(e) => setDeleting(e)}
        />
      </div>

      {showForm && (
        <EmployeeForm
          t={t}
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={async (data) => {
            if (editing) await onUpdate(editing.id, data);
            else await onAdd(data);
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {viewing && (
        <EmployeeDetailsModal
          t={t}
          language={language}
          employee={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {deleting && (
        <ConfirmDeleteModal
          t={t}
          onCancel={() => setDeleting(null)}
          onConfirm={async (password) => {
            await onDelete(deleting.id, password);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
