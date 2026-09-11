const DEFAULT_DOMAIN = "iberia.es";
const SESSION_COOKIE = "gls_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function configuredDomain(env) {
  return (env.ALLOWED_EMAIL_DOMAIN || DEFAULT_DOMAIN)
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

export function userFromEmail(email, name, env) {
  const normalisedEmail = String(email || "").trim().toLowerCase();
  if (!normalisedEmail || !normalisedEmail.endsWith(`@${configuredDomain(env)}`)) return null;

  return {
    email: normalisedEmail,
    name: String(name || "").trim().slice(0, 120) || normalisedEmail.split("@")[0],
  };
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value) {
  const padded = String(value || "").replaceAll("-", "+").replaceAll("_", "/")
    .padEnd(Math.ceil(String(value || "").length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(value, signature, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureBytes = Uint8Array.from(atob(
    String(signature || "").replaceAll("-", "+").replaceAll("_", "/")
      .padEnd(Math.ceil(String(signature || "").length / 4) * 4, "="),
  ), (character) => character.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(value));
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.get("cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key === name) return part.slice(separator + 1).trim();
  }
  return "";
}

async function userFromSession(request, env) {
  const secret = String(env.APP_PASSWORD || "");
  if (!secret) return null;
  const token = cookieValue(request, SESSION_COOKIE);
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const payloadEncoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  try {
    if (!await verify(payloadEncoded, signature, secret)) return null;
    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    if (!payload || Number(payload.exp || 0) < Math.floor(Date.now() / 1000)) return null;
    return userFromEmail(payload.email, payload.name, env);
  } catch {
    return null;
  }
}

export async function getUser(request, env) {
  // Access se mantiene como compatibilidad opcional. En el modo gratuito se
  // configura APP_PASSWORD y se ignoran los encabezados que cualquier cliente
  // podría intentar falsificar en una URL pública de Pages.
  if (!env.APP_PASSWORD) {
    const accessEmail = request.headers.get("cf-access-authenticated-user-email") || "";
    const accessName = request.headers.get("cf-access-authenticated-user-name") || "";
    const accessUser = userFromEmail(accessEmail, accessName, env);
    if (accessUser) return accessUser;

    const demoEmail = env.ENVIRONMENT === "development"
      ? request.headers.get("x-demo-user-email") || ""
      : "";
    const demoUser = userFromEmail(demoEmail, "", env);
    if (demoUser) return demoUser;
  }

  return userFromSession(request, env);
}

export async function createSessionCookie({ email, name }, env) {
  const secret = String(env.APP_PASSWORD || "");
  if (!secret) throw new Error("Falta configurar APP_PASSWORD.");
  const payload = base64UrlEncode(JSON.stringify({
    email,
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }));
  const signature = await sign(payload, secret);
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
