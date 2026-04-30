"use client";

import { useState } from "react";
import { phonesMatch } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

export default function GlobalPhoneSearch({ t, freshLeads, contactedLeads }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResult(null);
      return;
    }
    const inContacted = contactedLeads.find((l) => phonesMatch(l.phone, q));
    if (inContacted) {
      setResult({ type: "contacted", lead: inContacted });
      return;
    }
    const inFresh = freshLeads.find((l) => phonesMatch(l.phone, q));
    if (inFresh) {
      setResult({ type: "fresh", lead: inFresh });
      return;
    }
    setResult({ type: "none" });
  };

  const handleClear = () => {
    setQuery("");
    setResult(null);
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
        <button type="submit" className="btn btn-primary">
          {t.search}
        </button>
        <button type="button" className="btn" onClick={handleClear}>
          {t.clear}
        </button>
      </form>

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
            <div className="detail-item">
              <div className="label">{t.email}</div>
              <div className="value">{result.lead.email || "-"}</div>
            </div>
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
            <div className="detail-item">
              <div className="label">{t.houseianaUnitLink}</div>
              <div className="value">
                {result.lead.houseianaUnitLink ? (
                  <a
                    href={result.lead.houseianaUnitLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {result.lead.houseianaUnitLink}
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
          </div>
        </div>
      )}

      {result && result.type === "fresh" && (
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
