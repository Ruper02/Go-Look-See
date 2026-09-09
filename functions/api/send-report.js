import { getUser } from "../_lib/auth.js";
import { fail, json } from "../_lib/http.js";

const DEFAULT_RECIPIENTS = [
  "acastillome@iberia.es",
  "dcaballero@iberia.es",
  "rhgarcia@iberia.es",
  "cprudencio@iberia.es",
  "jhernandezdo@iberia.es",
];
const MAX_ATTACHMENT_BYTES = 4_500_000;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function recipientsFromEnv(env) {
  const configured = String(env.REPORT_RECIPIENTS || "");
  const values = (configured ? configured.split(",") : DEFAULT_RECIPIENTS)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value));
  return values.length ? values : DEFAULT_RECIPIENTS;
}

export async function onRequestPost({ request, env }) {
  const user = getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  if (!env.EMAIL || typeof env.EMAIL.send !== "function" || !env.MAIL_FROM) {
    return fail("El envío automático todavía no está configurado. Descarga el informe para adjuntarlo manualmente.", 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return fail("No se ha podido leer el informe.", 400);
  }
  const report = form.get("report");
  if (!(report instanceof File) || !report.size) return fail("Falta el archivo del informe.", 400);
  if (report.size > MAX_ATTACHMENT_BYTES) return fail("El informe supera el tamaño máximo para el envío por correo.", 413);

  const subject = String(form.get("subject") || "Informe Go, Look & See").trim().slice(0, 220);
  const summary = String(form.get("summary") || "").trim().slice(0, 4_000);
  try {
    const result = await env.EMAIL.send({
      from: env.MAIL_FROM,
      to: recipientsFromEnv(env),
      subject,
      html: `<p>Se adjunta el informe de la revisión Go, Look &amp; See.</p><p>Enviado por: ${escapeHtml(user.name || user.email)} (${escapeHtml(user.email)}).</p>${summary ? `<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${escapeHtml(summary)}</pre>` : ""}`,
      text: `Se adjunta el informe de la revisión Go, Look & See.\nEnviado por: ${user.name || user.email} (${user.email}).\n\n${summary}`,
      attachments: [{
        content: await report.arrayBuffer(),
        filename: String(report.name || "informe-go-look-see.html").replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 150),
        type: "text/html",
        disposition: "attachment",
      }],
    });
    return json({ sent: true, messageId: result?.messageId || "" });
  } catch (error) {
    return fail(`No se ha podido enviar el informe: ${error?.message || "error del servicio de correo"}`, 502);
  }
}

