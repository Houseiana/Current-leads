import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  checkActionPassword,
  requireDeletePassword,
  requireRole,
} from "@/lib/api-helpers";
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

export async function PUT(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const pw = checkActionPassword(body?.password);
  if (pw.error) return pw.error;

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
    `UPDATE employees SET
      full_name = $1,
      phone = $2,
      email = $3,
      address = $4,
      national_id = $5,
      birth_date = $6,
      marital_status = $7,
      children_count = $8,
      education = $9,
      previous_experience = $10,
      work_phone = $11,
      emergency_phone = $12,
      job_title = $13,
      department = $14,
      employment_type = $15,
      contract_type = $16,
      hire_date = $17,
      work_location = $18,
      direct_manager = $19,
      status = $20,
      monthly_salary = $21,
      payment_method = $22,
      bank_account = $23,
      updated_at = NOW()
    WHERE id = $24
    RETURNING *`,
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
      params.id,
    ]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ employee: toEmployee(rows[0]) });
}

export async function DELETE(req, { params }) {
  const auth = await requireRole("admin");
  if (auth.error) return auth.error;
  const pw = await requireDeletePassword(req);
  if (pw.error) return pw.error;
  const { rowCount } = await query(
    "DELETE FROM employees WHERE id = $1",
    [params.id]
  );
  if (!rowCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
