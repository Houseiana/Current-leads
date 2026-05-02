import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireRole } from "@/lib/api-helpers";
import { toEmployee } from "@/lib/serializers";

export const runtime = "nodejs";

function nullable(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  return v;
}

function nullableInt(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function nullableNumeric(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function nullableDate(v) {
  if (!v) return null;
  return v;
}

export async function GET() {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const { rows } = await query(
    "SELECT * FROM employees ORDER BY created_at DESC"
  );
  return NextResponse.json({ employees: rows.map(toEmployee) });
}

export async function POST(req) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body?.fullName?.toString().trim()) {
    return NextResponse.json(
      { error: "Full name is required." },
      { status: 400 }
    );
  }
  if (!body?.phone?.toString().trim()) {
    return NextResponse.json(
      { error: "Phone is required." },
      { status: 400 }
    );
  }

  const { rows } = await query(
    `INSERT INTO employees (
      full_name, phone, email, address, national_id, birth_date,
      marital_status, children_count, education, previous_experience,
      work_phone, emergency_phone, job_title, department,
      employment_type, contract_type, hire_date, work_location,
      direct_manager, status, monthly_salary, payment_method, bank_account
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10,
      $11, $12, $13, $14,
      $15, $16, $17, $18,
      $19, $20, $21, $22, $23
    ) RETURNING *`,
    [
      body.fullName.trim(),
      body.phone.trim(),
      nullable(body.email),
      nullable(body.address),
      nullable(body.nationalId),
      nullableDate(body.birthDate),
      nullable(body.maritalStatus),
      nullableInt(body.childrenCount),
      nullable(body.education),
      nullable(body.previousExperience),
      nullable(body.workPhone),
      nullable(body.emergencyPhone),
      nullable(body.jobTitle),
      nullable(body.department),
      nullable(body.employmentType),
      nullable(body.contractType),
      nullableDate(body.hireDate),
      nullable(body.workLocation),
      nullable(body.directManager),
      nullable(body.status) || "Active",
      nullableNumeric(body.monthlySalary),
      nullable(body.paymentMethod),
      nullable(body.bankAccount),
    ]
  );
  return NextResponse.json(
    { employee: toEmployee(rows[0]) },
    { status: 201 }
  );
}
