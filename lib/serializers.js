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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contactedAt: row.contacted_at,
  };
}

export function toEmployee(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email || "",
    address: row.address || "",
    nationalId: row.national_id || "",
    birthDate: row.birth_date || null,
    maritalStatus: row.marital_status || "",
    childrenCount: row.children_count == null ? "" : row.children_count,
    education: row.education || "",
    previousExperience: row.previous_experience || "",
    workPhone: row.work_phone || "",
    emergencyPhone: row.emergency_phone || "",
    jobTitle: row.job_title || "",
    department: row.department || "",
    employmentType: row.employment_type || "",
    contractType: row.contract_type || "",
    hireDate: row.hire_date || null,
    workLocation: row.work_location || "",
    directManager: row.direct_manager || "",
    status: row.status || "",
    monthlySalary: row.monthly_salary == null ? "" : row.monthly_salary,
    paymentMethod: row.payment_method || "",
    bankAccount: row.bank_account || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
