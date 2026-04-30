"use client";

export default function FilterBar({ t, filters, values, onChange }) {
  return (
    <div className="filters">
      {filters.map((f) => (
        <select
          key={f.key}
          className="select"
          style={{ maxWidth: 200 }}
          value={values[f.key] || ""}
          onChange={(e) => onChange(f.key, e.target.value)}
        >
          <option value="">{f.label}: {t.allOption}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
