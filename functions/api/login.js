import { createSessionCookie, userFromEmail } from "../_lib/auth.js";
import { fail, json, readJson, stringValue } from "../_lib/http.js";

export async function onRequestPost({ request, env }) {
  const configuredPassword = String(env.APP_PASSWORD || "");
  if (!configuredPassword) return fail("El acceso gratuito todavía no está configurado. Falta APP_PASSWORD en Pages.", 503);

  let input;
  try {
    input = await readJson(request, 20_000);
  } catch (error) {
    return fail(error.message, 400);
  }

  const email = stringValue(input?.email).toLowerCase();
  const password = typeof input?.password === "string" ? input.password : "";
  const user = userFromEmail(email, "", env);
  if (!user || password !== configuredPassword) return fail("El correo o la clave no son correctos.", 401);

  const cookie = await createSessionCookie(user, env);
  return json({ authenticated: true, user }, 200, { "Set-Cookie": cookie });
}

