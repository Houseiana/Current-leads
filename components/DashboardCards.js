"use client";

export default function DashboardCards({ items }) {
  return (
    <div className="cards">
      {items.map((item, i) => (
        <div key={i} className={`card ${item.accent ? "accent" : ""}`}>
          <div className="label">{item.label}</div>
          <div className="value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
