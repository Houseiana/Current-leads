"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardCards from "./DashboardCards";
import FilterBar from "./FilterBar";
import FreshLeadForm from "./FreshLeadForm";
import FreshLeadTable from "./FreshLeadTable";
import FreshLeadDetailsModal from "./FreshLeadDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { isThisWeek, isToday, uniqueValues } from "@/lib/utils";

export default function FreshLeadsSection({
  t,
  language,
  leads,
  onAdd,
  onUpdate,
  onDelete,
  onConvert,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [salesUsers, setSalesUsers] = useState([]);
  const [filters, setFilters] = useState({
    area: "",
    projectName: "",
    leadSource: "",
    owner: "",
  });

  useEffect(() => {
    fetch("/api/users/sales")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.users) setSalesUsers(d.users);
      })
      .catch(() => {});
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (filters.area && l.area !== filters.area) return false;
      if (filters.projectName && l.projectName !== filters.projectName)
        return false;
      if (filters.leadSource && l.leadSource !== filters.leadSource)
        return false;
      if (filters.owner) {
        if (filters.owner === "__unassigned__") {
          if (l.owner) return false;
        } else if (l.owner !== filters.owner) {
          return false;
        }
      }
      return true;
    });
  }, [leads, filters]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      today: leads.filter((l) => isToday(l.createdAt)).length,
      week: leads.filter((l) => isThisWeek(l.createdAt)).length,
    };
  }, [leads]);

  const filterDefs = [
    {
      key: "area",
      label: t.filterByArea,
      options: uniqueValues(leads, "area").map((v) => ({ value: v, label: v })),
    },
    {
      key: "projectName",
      label: t.filterByProject,
      options: uniqueValues(leads, "projectName").map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      key: "leadSource",
      label: t.filterBySource,
      options: uniqueValues(leads, "leadSource").map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      key: "owner",
      label: t.assignTo,
      options: [
        { value: "__unassigned__", label: t.unassigned },
        ...salesUsers.map((u) => ({
          value: u.username,
          label: u.displayName,
        })),
      ],
    },
  ];

  return (
    <div>
      <DashboardCards
        items={[
          { label: t.totalFreshLeads, value: stats.total, accent: true },
          { label: t.todayFreshLeads, value: stats.today },
          { label: t.weekFreshLeads, value: stats.week },
        ]}
      />

      <div className="panel">
        <h2 className="panel-title">
          <span>{t.freshLeads}</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t.addFreshLead}
          </button>
        </h2>

        <div className="toolbar">
          <FilterBar
            t={t}
            filters={filterDefs}
            values={filters}
            onChange={(key, value) =>
              setFilters((f) => ({ ...f, [key]: value }))
            }
          />
        </div>

        <FreshLeadTable
          t={t}
          language={language}
          leads={filteredLeads}
          onView={(l) => setViewing(l)}
          onEdit={(l) => {
            setEditing(l);
            setShowForm(true);
          }}
          onDelete={(l) => setDeleting(l)}
          onConvert={(l) => onConvert(l)}
        />
      </div>

      {showForm && (
        <FreshLeadForm
          t={t}
          initial={editing}
          salesUsers={salesUsers}
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
        <FreshLeadDetailsModal
          t={t}
          language={language}
          lead={viewing}
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
