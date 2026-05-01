"use client";

import { useState } from "react";
import DashboardCards from "./DashboardCards";
import BlacklistForm from "./BlacklistForm";
import BlacklistTable from "./BlacklistTable";
import BlacklistDetailsModal from "./BlacklistDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function BlacklistSection({
  t,
  language,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  return (
    <div>
      <DashboardCards
        items={[
          { label: t.totalBlacklist, value: entries.length, accent: true },
        ]}
      />

      <div className="panel">
        <h2 className="panel-title">
          <span>{t.blacklist}</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t.addBlacklist}
          </button>
        </h2>

        <BlacklistTable
          t={t}
          language={language}
          entries={entries}
          onView={(e) => setViewing(e)}
          onEdit={(e) => {
            setEditing(e);
            setShowForm(true);
          }}
          onDelete={(e) => setDeleting(e)}
        />
      </div>

      {showForm && (
        <BlacklistForm
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
        <BlacklistDetailsModal
          t={t}
          language={language}
          entry={viewing}
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
