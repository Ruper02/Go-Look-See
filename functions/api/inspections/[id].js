import { getUser } from "../../_lib/auth.js";
import { fail, json } from "../../_lib/http.js";

export async function onRequestDelete({ request, env, params }) {
  const user = getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || typeof env.DB.prepare !== "function") return fail("La base de datos compartida todavía no está configurada.", 503);

  const id = String(params.id || "");
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(id)) return fail("El identificador de la revisión no es válido.", 400);

  const photos = await env.DB.prepare("SELECT object_key FROM photos WHERE inspection_id = ?").bind(id).all();
  if (env.PHOTOS && typeof env.PHOTOS.delete === "function") {
    const keys = (photos.results || [])
      .map((photo) => String(photo.object_key || ""))
      .filter((key) => key && !key.startsWith("d1/"));
    await Promise.all(keys.map((key) => env.PHOTOS.delete(key)));
  }
  await env.DB.prepare("DELETE FROM photos WHERE inspection_id = ?").bind(id).run();
  await env.DB.prepare("DELETE FROM inspections WHERE id = ?").bind(id).run();
  return json({ deleted: true, id });
}
