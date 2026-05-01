"use client";

export default function Toast({ message, variant = "success" }) {
  return <div className={`toast ${variant}`}>{message}</div>;
}
