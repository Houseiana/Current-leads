export function toFreshLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    area: row.area,
    projectName: row.project_name,
    leadSource: row.lead_source,
    leadSourceLink: row.lead_source_link || "",
    leadType: row.lead_type || "",
    owner: row.owner || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toContactedLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    area: row.area || "",
    unit: row.unit || "",
    salesName: row.sales_name,
    salesPhoneUsed: row.sales_phone_used || "",
    salesWhatsAppUsed: row.sales_whatsapp_used || "",
    status: row.status,
    unitLink: row.unit_link || "",
    webLeadSourceLink: row.web_lead_source_link || "",
    leadType: row.lead_type || "",
    notes: row.notes || "",
    callAt: row.call_at || null,
    owner: row.owner || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contactedAt: row.contacted_at,
  };
}

export function toBlacklistEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || "",
    phone: row.phone,
    reason: row.reason || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
