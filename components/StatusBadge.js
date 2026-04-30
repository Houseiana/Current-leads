"use client";

const STATUS_CLASS = {
  Called: "called",
  "Follow Ups": "followups",
  "Sent Unit": "sentunit",
  "List His Unit": "listunit",
};

const STATUS_KEY = {
  Called: "statusCalled",
  "Follow Ups": "statusFollowUps",
  "Sent Unit": "statusSentUnit",
  "List His Unit": "statusListUnit",
};

export default function StatusBadge({ status, t }) {
  if (!status) return <span className="badge">-</span>;
  const cls = STATUS_CLASS[status] || "called";
  const labelKey = STATUS_KEY[status];
  const label = labelKey && t ? t[labelKey] : status;
  return <span className={`badge ${cls}`}>{label}</span>;
}
