"use client";

import Modal from "./Modal";
import { formatDate } from "@/lib/utils";
import {
  CONTRACT_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  optionLabel,
} from "@/lib/translations";

function dateLabel(value, language) {
  if (!value) return "-";
  return formatDate(value, language).split(",")[0];
}

function Field({ label, value }) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{value || "-"}</div>
    </div>
  );
}

export default function EmployeeDetailsModal({ t, language, employee, onClose }) {
  if (!employee) return null;
  const e = employee;

  const Section = ({ title, children }) => (
    <>
      <div
        style={{
          color: "var(--color-muted)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          margin: "16px 0 6px",
          fontWeight: 700,
          paddingBottom: 4,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {title}
      </div>
      <div className="detail-grid">{children}</div>
    </>
  );

  return (
    <Modal
      title={t.employeeDetails}
      onClose={onClose}
      footer={
        <button type="button" className="btn" onClick={onClose}>
          {t.close}
        </button>
      }
    >
      <Section title={t.sectionPersonal}>
        <Field label={t.fullName} value={e.fullName} />
        <Field label={t.phone} value={e.phone} />
        <Field label={t.email} value={e.email} />
        <Field label={t.address} value={e.address} />
        <Field label={t.nationalId} value={e.nationalId} />
        <Field label={t.birthDate} value={dateLabel(e.birthDate, language)} />
        <Field
          label={t.maritalStatus}
          value={optionLabel(MARITAL_STATUS_OPTIONS, e.maritalStatus, t)}
        />
        <Field
          label={t.childrenCount}
          value={
            e.childrenCount === "" || e.childrenCount == null
              ? "-"
              : e.childrenCount
          }
        />
      </Section>

      <Section title={t.sectionEducation}>
        <Field label={t.education} value={e.education} />
      </Section>
      {e.previousExperience && (
        <div className="notes-block" style={{ marginTop: 8 }}>
          {e.previousExperience}
        </div>
      )}

      <Section title={t.sectionContact}>
        <Field label={t.workPhone} value={e.workPhone} />
        <Field label={t.emergencyPhone} value={e.emergencyPhone} />
      </Section>

      <Section title={t.sectionWork}>
        <Field label={t.jobTitle} value={e.jobTitle} />
        <Field label={t.department} value={e.department} />
        <Field
          label={t.employmentType}
          value={optionLabel(EMPLOYMENT_TYPE_OPTIONS, e.employmentType, t)}
        />
        <Field
          label={t.contractType}
          value={optionLabel(CONTRACT_TYPE_OPTIONS, e.contractType, t)}
        />
        <Field label={t.hireDate} value={dateLabel(e.hireDate, language)} />
        <Field label={t.workLocation} value={e.workLocation} />
        <Field label={t.directManager} value={e.directManager} />
        <Field
          label={t.employeeStatus}
          value={optionLabel(EMPLOYEE_STATUS_OPTIONS, e.status, t)}
        />
      </Section>

      <Section title={t.sectionPayroll}>
        <Field
          label={t.monthlySalary}
          value={
            e.monthlySalary === "" || e.monthlySalary == null
              ? "-"
              : e.monthlySalary
          }
        />
        <Field
          label={t.paymentMethod}
          value={optionLabel(PAYMENT_METHOD_OPTIONS, e.paymentMethod, t)}
        />
        <Field label={t.bankAccount} value={e.bankAccount} />
      </Section>

      <Section title={t.createdAt}>
        <Field label={t.createdAt} value={formatDate(e.createdAt, language)} />
        <Field label={t.updatedAt} value={formatDate(e.updatedAt, language)} />
      </Section>
    </Modal>
  );
}
