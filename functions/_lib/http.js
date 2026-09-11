export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export function fail(message, status = 400) {
  return json({ error: message }, status);
}

export async function readJson(request, maxBytes = 4_000_000) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new Error("La revisión supera el tamaño máximo permitido.");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("El cuerpo de la petición no es un JSON válido.");
  }
}

export function stringValue(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

