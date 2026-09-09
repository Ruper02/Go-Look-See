const DEFAULT_DOMAIN = "iberia.es";

export function getUser(request, env) {
  // Cloudflare Access añade este encabezado tras autenticar al usuario.
  // El encabezado de desarrollo solo se permite al ejecutar el proyecto localmente.
  const accessEmail = request.headers.get("cf-access-authenticated-user-email") || "";
  const demoEmail = env.ENVIRONMENT === "development"
    ? request.headers.get("x-demo-user-email") || ""
    : "";
  const email = (accessEmail || demoEmail).trim().toLowerCase();
  if (!email) return null;

  const configuredDomain = (env.ALLOWED_EMAIL_DOMAIN || DEFAULT_DOMAIN)
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
  if (!email.endsWith(`@${configuredDomain}`)) return null;

  const name = (request.headers.get("cf-access-authenticated-user-name") || "")
    .trim()
    .slice(0, 120);
  return {
    email,
    name: name || email.split("@")[0],
  };
}

