import { getUser } from "../_lib/auth.js";
import { fail, json } from "../_lib/http.js";

export async function onRequestGet({ request, env }) {
  const user = await getUser(request, env);
  if (!user) return fail("Acceso no autorizado. Inicia sesión con tu cuenta @iberia.es.", 401);
  return json({ authenticated: true, user });
}
