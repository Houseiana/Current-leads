"use client";

import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";
import { leadTypeLabel } from "@/lib/translations";

export default function GlobalPhoneSearch({ t, language, salesMode = false }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResult(null);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: q }),
      });
      if (!res.ok) {
        setErrorMsg(t.networkError);
        setResult(null);
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      setErrorMsg(t.networkError);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="panel">
      <h2 className="panel-title">{t.searchByPhone}</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <input
          className="input"
          style={{ flex: 1, minWidth: 220 }}
          type="tel"
          inputMode="tel"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t.loading : t.search}
        </button>
        <button type="button" className="btn" onClick={handleClear}>
          {t.clear}
        </button>
      </form>

      {errorMsg && (
        <div className="search-result not-found">
          <h3>{errorMsg}</h3>
        </div>
      )}

      {result && result.type === "blacklist" && (
        <div className="search-result blacklisted">
          <h3>{t.blacklistedDoNotContact}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">{t.name}</div>
              <div className="value">{result.lead.name || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.phone}</div>
              <div className="value">{result.lead.phone || "-"}</div>
            </div>
            <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
              <div className="label">{t.reason}</div>
              <div className="value">{result.lead.reason || "-"}</div>
            </div>
          </div>
        </div>
      )}

      {result && result.type === "contacted" && (
        <div className="search-result found-contacted">
          <h3>{t.resultExisting}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">{t.name}</div>
              <div className="value">{result.lead.name || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.phone}</div>
              <div className="value">{result.lead.phone || "-"}</div>
            </div>
            {!salesMode && (
              <div className="detail-item">
                <div className="label">{t.email}</div>
                <div className="value">{result.lead.email || "-"}</div>
              </div>
            )}
            <div className="detail-item">
              <div className="label">{t.area}</div>
              <div className="value">{result.lead.area || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.unit}</div>
              <div className="value">{result.lead.unit || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.salesName}</div>
              <div className="value">{result.lead.salesName || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.status}</div>
              <div className="value">
                <StatusBadge status={result.lead.status} t={t} />
              </div>
            </div>
            {salesMode && result.lead.contactedAt && (
              <div className="detail-item">
                <div className="label">{t.contactedAt}</div>
                <div className="value">
                  {formatDate(result.lead.contactedAt, language)}
                </div>
              </div>
            )}
            {!salesMode && (
              <>
                <div className="detail-item">
                  <div className="label">{t.unitLink}</div>
                  <div className="value">
                    {result.lead.unitLink ? (
                      <a
                        href={result.lead.unitLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result.lead.unitLink}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="label">{t.webLeadSourceLink}</div>
                  <div className="value">
                    {result.lead.webLeadSourceLink ? (
                      <a
                        href={result.lead.webLeadSourceLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {result.lead.webLeadSourceLink}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {result && result.type === "fresh" && !salesMode && (
        <div className="search-result found-fresh">
          <h3>{t.resultFresh}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <div className="label">{t.name}</div>
              <div className="value">{result.lead.name || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.phone}</div>
              <div className="value">{result.lead.phone || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.area}</div>
              <div className="value">{result.lead.area || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.projectName}</div>
              <div className="value">{result.lead.projectName || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.leadSource}</div>
              <div className="value">{result.lead.leadSource || "-"}</div>
            </div>
            <div className="detail-item">
              <div className="label">{t.leadType}</div>
              <div className="value">
                {leadTypeLabel(result.lead.leadType, t)}
              </div>
            </div>
            <div className="detail-item">
              <div className="label">{t.leadSourceLink}</div>
              <div className="value">
                {result.lead.leadSourceLink ? (
                  <a
                    href={result.lead.leadSourceLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.lead.leadSourceLink}
                  </a>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {result && result.type === "none" && (
        <div className="search-result not-found">
          <h3>{t.resultNotFound}</h3>
        </div>
      )}
    </div>
  );
}
