"use client";

import { useMemo, useState } from "react";
import DashboardCards from "./DashboardCards";
import FilterBar from "./FilterBar";
import ContactedLeadForm from "./ContactedLeadForm";
import ContactedLeadTable from "./ContactedLeadTable";
import ContactedLeadDetailsModal from "./ContactedLeadDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { uniqueValues } from "@/lib/utils";
import { SALES_NAMES, STATUS_OPTIONS } from "@/lib/translations";

export default function ContactedLeadsSection({
  t,
  language,
  leads,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    salesName: "",
    area: "",
    unit: "",
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (filters.status && l.status !== filters.status) return false;
      if (filters.salesName && l.salesName !== filters.salesName) return false;
      if (filters.area && l.area !== filters.area) return false;
      if (filters.unit && l.unit !== filters.unit) return false;
      return true;
    });
  }, [leads, filters]);

  const stats = useMemo(() => {
    const counts = {
      total: leads.length,
      Called: 0,
      "No Answer": 0,
      "Phone Off": 0,
      "Sent on WhatsApp": 0,
      "Follow Ups": 0,
      "Sent Unit": 0,
      "List His Unit": 0,
      "Not Interested": 0,
    };
    leads.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    });
    return counts;
  }, [leads]);

  const filterDefs = [
    {
      key: "status",
      label: t.filterByStatus,
      options: STATUS_OPTIONS.map((s) => ({
        value: s.value,
        label: t[s.labelKey],
      })),
    },
    {
      key: "salesName",
      label: t.filterBySales,
      options: SALES_NAMES.map((v) => ({ value: v, label: v })),
    },
    {
      key: "area",
      label: t.filterByArea,
      options: uniqueValues(leads, "area").map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      key: "unit",
      label: t.filterByUnit,
      options: uniqueValues(leads, "unit").map((v) => ({
        value: v,
        label: v,
      })),
    },
  ];

  return (
    <div>
      <DashboardCards
        items={[
          { label: t.totalContactedLeads, value: stats.total, accent: true },
          { label: t.statusCalled, value: stats.Called },
          { label: t.statusNoAnswer, value: stats["No Answer"] },
          { label: t.statusPhoneOff, value: stats["Phone Off"] },
          { label: t.statusSentWhatsApp, value: stats["Sent on WhatsApp"] },
          { label: t.statusFollowUps, value: stats["Follow Ups"] },
          { label: t.statusSentUnit, value: stats["Sent Unit"] },
          { label: t.statusListUnit, value: stats["List His Unit"] },
          { label: t.statusNotInterested, value: stats["Not Interested"] },
        ]}
      />

      <div className="panel">
        <h2 className="panel-title">
          <span>{t.contactedLeads}</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t.addContactedLead}
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

        <ContactedLeadTable
          t={t}
          language={language}
          leads={filteredLeads}
          onView={(l) => setViewing(l)}
          onEdit={(l) => {
            setEditing(l);
            setShowForm(true);
          }}
          onDelete={(l) => setDeleting(l)}
        />
      </div>

      {showForm && (
        <ContactedLeadForm
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
        <ContactedLeadDetailsModal
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
