import { getUser } from "../../_lib/auth.js";
import { fail, json } from "../../_lib/http.js";

function photoBytes(value) {
  // D1 convierte los BLOB leídos mediante la API de bindings en un Array.
  // Response necesita recibir bytes reales, no la representación textual del
  // array (por ejemplo, "255,216,255...").
  if (Array.isArray(value)) return Uint8Array.from(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return value;
}

export async function onRequestGet({ request, env, params }) {
  const user = await getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || typeof env.DB.prepare !== "function") return fail("La base de datos compartida todavía no está configurada.", 503);

  const id = String(params.id || "");
  const photo = await env.DB.prepare("SELECT object_key, content_type, photo_data FROM photos WHERE id = ?").bind(id).first();
  if (!photo) return fail("Fotografía no encontrada.", 404);
  const headers = new Headers();
  headers.set("content-type", photo.content_type || "image/jpeg");
  headers.set("cache-control", "private, max-age=60");

  // Modo gratuito: el BLOB vive dentro de D1 y no requiere R2.
  if (photo.photo_data !== null && photo.photo_data !== undefined) {
    const body = photoBytes(photo.photo_data);
    return new Response(body, { headers });
  }

  // Compatibilidad con fotografías antiguas que se hubieran guardado en R2.
  if (!env.PHOTOS || typeof env.PHOTOS.get !== "function") return fail("Fotografía no encontrada en el almacenamiento.", 404);
  const object = await env.PHOTOS.get(photo.object_key);
  if (!object) return fail("Fotografía no encontrada en el almacenamiento.", 404);
  object.writeHttpMetadata(headers);
  headers.set("content-type", photo.content_type || headers.get("content-type") || "image/jpeg");
  return new Response(object.body, { headers });
}

export async function onRequestDelete({ request, env, params }) {
  const user = await getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || typeof env.DB.prepare !== "function") return fail("La base de datos compartida todavía no está configurada.", 503);

  const id = String(params.id || "");
  const photo = await env.DB.prepare("SELECT object_key FROM photos WHERE id = ?").bind(id).first();
  if (!photo) return fail("Fotografía no encontrada.", 404);
  if (env.PHOTOS && typeof env.PHOTOS.delete === "function" && !String(photo.object_key || "").startsWith("d1/")) {
    await env.PHOTOS.delete(photo.object_key);
  }
  await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
  return json({ deleted: true, id });
}
