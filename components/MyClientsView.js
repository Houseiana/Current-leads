"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import FreshLeadForm from "./FreshLeadForm";
import FreshLeadDetailsModal from "./FreshLeadDetailsModal";
import ContactedLeadForm from "./ContactedLeadForm";
import ContactedLeadDetailsModal from "./ContactedLeadDetailsModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { formatDate } from "@/lib/utils";

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = res.status;
    err.code = data?.code;
    err.existing = data?.existing;
    throw err;
  }
  return data;
}

export default function MyClientsView({ t, language }) {
  const [tab, setTab] = useState("contacted");
  const [fresh, setFresh] = useState([]);
  const [contacted, setContacted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state — { type: "fresh" | "contacted", lead }
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [fRes, cRes] = await Promise.all([
        fetch("/api/fresh-leads"),
        fetch("/api/contacted-leads"),
      ]);
      if (fRes.ok) {
        const f = await fRes.json();
        setFresh(f.leads || []);
      }
      if (cRes.ok) {
        const c = await cRes.json();
        setContacted(c.leads || []);
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdate = async (type, id, data) => {
    await jsonFetch(`/api/${type}-leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    await load();
  };

  const handleDelete = async (type, id, password) => {
    await jsonFetch(`/api/${type}-leads/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    await load();
  };

  const empty = fresh.length === 0 && contacted.length === 0;

  return (
    <div className="panel">
      <h2 className="panel-title">{t.myClientsTitle}</h2>

      <div className="tabs" style={{ marginTop: 0 }}>
        <button
          type="button"
          className={`tab ${tab === "contacted" ? "active" : ""}`}
          onClick={() => setTab("contacted")}
        >
          {t.myClientsContacted} ({contacted.length})
        </button>
        <button
          type="button"
          className={`tab ${tab === "fresh" ? "active" : ""}`}
          onClick={() => setTab("fresh")}
        >
          {t.myClientsFresh} ({fresh.length})
        </button>
      </div>

      {loading && <div style={{ padding: 20 }}>{t.loading}</div>}
      {error && <div className="login-error">{error}</div>}

      {!loading && empty && (
        <div className="empty-row" style={{ padding: 24, textAlign: "center" }}>
          {t.myClientsEmpty}
        </div>
      )}

      {!loading && tab === "contacted" && contacted.length > 0 && (
        <div className="table-wrap responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.phone}</th>
                <th>{t.status}</th>
                <th>{t.callAt}</th>
                <th>{t.contactedAt}</th>
                <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {contacted.map((l) => (
                <tr key={l.id}>
                  <td data-label={t.name}>{l.name}</td>
                  <td data-label={t.phone}>{l.phone}</td>
                  <td data-label={t.status}>
                    <StatusBadge status={l.status} t={t} />
                  </td>
                  <td data-label={t.callAt}>
                    {l.callAt ? formatDate(l.callAt, language) : "-"}
                  </td>
                  <td data-label={t.contactedAt}>
                    {formatDate(l.contactedAt, language)}
                  </td>
                  <td data-label={t.actions}>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setViewing({ type: "contacted", lead: l })}
                      >
                        {t.view}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setEditing({ type: "contacted", lead: l })}
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleting({ type: "contacted", lead: l })}
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
      )}

      {!loading && tab === "fresh" && fresh.length > 0 && (
        <div className="table-wrap responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.phone}</th>
                <th>{t.area}</th>
                <th>{t.projectName}</th>
                <th>{t.leadSource}</th>
                <th>{t.createdAt}</th>
                <th style={{ width: 1, whiteSpace: "nowrap" }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {fresh.map((l) => (
                <tr key={l.id}>
                  <td data-label={t.name}>{l.name}</td>
                  <td data-label={t.phone}>{l.phone}</td>
                  <td data-label={t.area}>{l.area}</td>
                  <td data-label={t.projectName}>{l.projectName}</td>
                  <td data-label={t.leadSource}>{l.leadSource}</td>
                  <td data-label={t.createdAt}>
                    {formatDate(l.createdAt, language)}
                  </td>
                  <td data-label={t.actions}>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setViewing({ type: "fresh", lead: l })}
                      >
                        {t.view}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setEditing({ type: "fresh", lead: l })}
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleting({ type: "fresh", lead: l })}
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
      )}

      {/* View modals */}
      {viewing?.type === "fresh" && (
        <FreshLeadDetailsModal
          t={t}
          language={language}
          lead={viewing.lead}
          onClose={() => setViewing(null)}
        />
      )}
      {viewing?.type === "contacted" && (
        <ContactedLeadDetailsModal
          t={t}
          language={language}
          lead={viewing.lead}
          onClose={() => setViewing(null)}
        />
      )}

      {/* Edit modals — both forms ask for the manager password (edit mode) */}
      {editing?.type === "fresh" && (
        <FreshLeadForm
          t={t}
          initial={editing.lead}
          onCancel={() => setEditing(null)}
          onSubmit={async (data) => {
            await handleUpdate("fresh", editing.lead.id, data);
            setEditing(null);
          }}
        />
      )}
      {editing?.type === "contacted" && (
        <ContactedLeadForm
          t={t}
          initial={editing.lead}
          hideSalesName
          onCancel={() => setEditing(null)}
          onSubmit={async (data) => {
            await handleUpdate("contacted", editing.lead.id, data);
            setEditing(null);
          }}
        />
      )}

      {/* Delete modal — already asks for the manager password */}
      {deleting && (
        <ConfirmDeleteModal
          t={t}
          onCancel={() => setDeleting(null)}
          onConfirm={async (password) => {
            await handleDelete(deleting.type, deleting.lead.id, password);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
