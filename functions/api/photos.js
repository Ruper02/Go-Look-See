import { getUser } from "../_lib/auth.js";
import { fail, json } from "../_lib/http.js";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  const user = getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.DB || typeof env.DB.prepare !== "function" || !env.PHOTOS || typeof env.PHOTOS.put !== "function") {
    return fail("El almacenamiento compartido de fotografías todavía no está configurado.", 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return fail("No se ha podido leer la fotografía.", 400);
  }
  const file = form.get("file");
  const inspectionId = String(form.get("inspectionId") || "");
  const itemId = String(form.get("itemId") || "");
  const requestedPhotoId = String(form.get("photoId") || "");
  if (!(file instanceof File) || !file.size) return fail("Falta la fotografía.", 400);
  if (file.size > MAX_PHOTO_BYTES) return fail("La fotografía supera el máximo de 10 MB.", 413);
  if (!file.type.startsWith("image/")) return fail("Solo se admiten archivos de imagen.", 415);
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(inspectionId) || !itemId) return fail("La referencia de la fotografía no es válida.", 400);

  const inspection = await env.DB.prepare("SELECT id FROM inspections WHERE id = ?").bind(inspectionId).first();
  if (!inspection) return fail("La revisión todavía no está disponible en el servidor.", 409);

  const photoId = /^[A-Za-z0-9_-]{8,120}$/.test(requestedPhotoId) ? requestedPhotoId : crypto.randomUUID();
  const existingPhoto = await env.DB.prepare("SELECT id, inspection_id, file_name, object_key FROM photos WHERE id = ?").bind(photoId).first();
  if (existingPhoto) {
    if (existingPhoto.inspection_id !== inspectionId) return fail("La fotografía ya pertenece a otra revisión.", 409);
    return json({
      photo: {
        id: existingPhoto.id,
        name: existingPhoto.file_name || "fotografia.jpg",
        url: `/api/photos/${existingPhoto.id}`,
      },
    });
  }
  const objectKey = `${inspectionId}/${photoId}`;
  await env.PHOTOS.put(objectKey, file.stream(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
    customMetadata: { uploadedBy: user.email, itemId },
  });

  try {
    await env.DB.prepare(
      "INSERT INTO photos (id, inspection_id, item_id, object_key, file_name, content_type, size_bytes, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(
      photoId,
      inspectionId,
      itemId,
      objectKey,
      String(file.name || "fotografia.jpg").slice(0, 180),
      file.type || "image/jpeg",
      file.size,
      new Date().toISOString(),
      user.email,
    ).run();
  } catch (error) {
    await env.PHOTOS.delete(objectKey);
    throw error;
  }

  return json({
    photo: {
      id: photoId,
      name: String(file.name || "fotografia.jpg").slice(0, 180),
      url: `/api/photos/${photoId}`,
    },
  });
}
