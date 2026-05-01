"use client";

const STATUS_CLASS = {
  Called: "called",
  "No Answer": "noanswer",
  "Phone Off": "phoneoff",
  "Sent on WhatsApp": "whatsapp",
  "Follow Ups": "followups",
  "Sent Unit": "sentunit",
  "List His Unit": "listunit",
  "Not Interested": "notinterested",
};

const STATUS_KEY = {
  Called: "statusCalled",
  "No Answer": "statusNoAnswer",
  "Phone Off": "statusPhoneOff",
  "Sent on WhatsApp": "statusSentWhatsApp",
  "Follow Ups": "statusFollowUps",
  "Sent Unit": "statusSentUnit",
  "List His Unit": "statusListUnit",
  "Not Interested": "statusNotInterested",
};

export default function StatusBadge({ status, t }) {
  if (!status) return <span className="badge">-</span>;
  const cls = STATUS_CLASS[status] || "called";
  const labelKey = STATUS_KEY[status];
  const label = labelKey && t ? t[labelKey] : status;
  return <span className={`badge ${cls}`}>{label}</span>;
}
