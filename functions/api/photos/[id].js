import { getUser } from "../../_lib/auth.js";
import { fail, json } from "../../_lib/http.js";

export async function onRequestGet({ request, env, params }) {
  const user = getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || !env.PHOTOS) return fail("El almacenamiento compartido de fotografías todavía no está configurado.", 503);

  const id = String(params.id || "");
  const photo = await env.DB.prepare("SELECT object_key, content_type FROM photos WHERE id = ?").bind(id).first();
  if (!photo) return fail("Fotografía no encontrada.", 404);
  const object = await env.PHOTOS.get(photo.object_key);
  if (!object) return fail("Fotografía no encontrada en el almacenamiento.", 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", photo.content_type || headers.get("content-type") || "image/jpeg");
  headers.set("cache-control", "private, max-age=60");
  return new Response(object.body, { headers });
}

export async function onRequestDelete({ request, env, params }) {
  const user = getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || !env.PHOTOS) return fail("El almacenamiento compartido de fotografías todavía no está configurado.", 503);

  const id = String(params.id || "");
  const photo = await env.DB.prepare("SELECT object_key FROM photos WHERE id = ?").bind(id).first();
  if (!photo) return fail("Fotografía no encontrada.", 404);
  await env.PHOTOS.delete(photo.object_key);
  await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run();
  return json({ deleted: true, id });
}

