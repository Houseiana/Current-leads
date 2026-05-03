"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";

export default function MyClientsView({ t, language }) {
  const [tab, setTab] = useState("contacted");
  const [fresh, setFresh] = useState([]);
  const [contacted, setContacted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
