import { getUser } from "../_lib/auth.js";
import { fail, json, readJson, stringValue } from "../_lib/http.js";

const VALID_STATUSES = new Set(["draft", "completed"]);
const MAX_INSPECTIONS = 500;

function requireDatabase(env) {
  return env.DB && typeof env.DB.prepare === "function";
}

function inspectionFromRow(row) {
  let inspection = {};
  try {
    inspection = JSON.parse(row.data_json || "{}");
  } catch {
    inspection = {};
  }
  return {
    ...inspection,
    id: row.id,
    status: row.status,
    createdBy: row.created_by || inspection.createdBy || "",
    updatedBy: row.updated_by || inspection.updatedBy || "",
    serverUpdatedAt: row.updated_at,
  };
}

function validateInspection(input, user, existingRow = null) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("La revisión no tiene un formato válido.");
  }

  const id = stringValue(input.id);
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(id)) throw new Error("El identificador de la revisión no es válido.");

  const status = VALID_STATUSES.has(input.status) ? input.status : "draft";
  const now = new Date().toISOString();
  const source = JSON.parse(JSON.stringify(input));
  source.id = id;
  source.status = status;
  source.areaId = stringValue(source.areaId);
  source.areaName = stringValue(source.areaName);
  source.date = stringValue(source.date);
  source.inspector = stringValue(source.inspector);
  source.location = stringValue(source.location);
  source.shift = stringValue(source.shift);
  source.generalNotes = stringValue(source.generalNotes);
  source.items = Array.isArray(source.items) ? source.items : [];
  source.createdAt = stringValue(source.createdAt) || existingRow?.created_at || now;
  source.updatedAt = stringValue(source.updatedAt) || now;
  source.createdBy = existingRow?.created_by || user.email;
  source.updatedBy = user.email;
  source.serverUpdatedAt = now;

  const serialised = JSON.stringify(source);
  if (serialised.length > 3_500_000) throw new Error("La revisión supera el tamaño máximo permitido.");
  return source;
}

export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!requireDatabase(env)) return fail("La base de datos compartida todavía no está configurada.", 503);

  const result = await env.DB.prepare(
    "SELECT id, status, data_json, created_at, updated_at, created_by, updated_by FROM inspections ORDER BY updated_at DESC LIMIT ?",
  ).bind(MAX_INSPECTIONS).all();
  return json({ inspections: (result.results || []).map(inspectionFromRow) });
}

export async function onRequestPost({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!requireDatabase(env)) return fail("La base de datos compartida todavía no está configurada.", 503);

  let input;
  try {
    input = await readJson(request);
  } catch (error) {
    return fail(error.message, 400);
  }

  const id = stringValue(input?.id);
  if (!id) return fail("Falta el identificador de la revisión.", 400);
  const existingRow = await env.DB.prepare(
    "SELECT created_at, created_by FROM inspections WHERE id = ?",
  ).bind(id).first();

  let inspection;
  try {
    inspection = validateInspection(input, user, existingRow);
  } catch (error) {
    return fail(error.message, 400);
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO inspections (
      id, status, area_id, area_name, inspection_date, inspector, location, shift,
      general_notes, data_json, created_at, updated_at, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      area_id = excluded.area_id,
      area_name = excluded.area_name,
      inspection_date = excluded.inspection_date,
      inspector = excluded.inspector,
      location = excluded.location,
      shift = excluded.shift,
      general_notes = excluded.general_notes,
      data_json = excluded.data_json,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).bind(
    inspection.id,
    inspection.status,
    inspection.areaId,
    inspection.areaName,
    inspection.date,
    inspection.inspector,
    inspection.location,
    inspection.shift,
    inspection.generalNotes,
    JSON.stringify(inspection),
    existingRow?.created_at || inspection.createdAt || now,
    now,
    existingRow?.created_by || inspection.createdBy || user.email,
    user.email,
  ).run();

  inspection.serverUpdatedAt = now;
  return json({ inspection });
}
