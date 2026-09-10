/*
 * Go, Look & See · Talleres
 * Front-end estático. En Cloudflare Pages utiliza las Functions /api para
 * compartir revisiones y fotografías; si se abre como archivo local mantiene
 * un modo local de respaldo.
 *
 * Para personalizar la guía, edita el array CHECKLISTS de este archivo.
 */

const RECIPIENTS = [
  "acastillome@iberia.es",
  "dcaballero@iberia.es",
  "rhgarcia@iberia.es",
  "cprudencio@iberia.es",
  "jhernandezdo@iberia.es",
];

const STORAGE_KEYS = {
  inspections: "gls-inspections-v1",
  draft: "gls-current-draft-v1",
};

const PHOTO_DB = {
  name: "gls-photo-db-v1",
  store: "photos",
};

const STATUS = {
  pending: { label: "Pendiente", short: "Pendiente", className: "pending" },
  ok: { label: "Conforme", short: "Conforme", className: "ok" },
  improve: { label: "Mejora", short: "Mejora", className: "improve" },
  critical: { label: "Acción prioritaria", short: "Prioritaria", className: "critical" },
  na: { label: "No aplica", short: "N/A", className: "na" },
};

const ACTION_STATUS = {
  open: { label: "Abierta", className: "action-open" },
  in_progress: { label: "En curso", className: "action-progress" },
  closed: { label: "Cerrada", className: "action-closed" },
};

const AREA_COLORS = ["#1f5cce", "#e32945", "#7054c5", "#17835d", "#b36a05", "#3a8b9d", "#d05a33", "#8c5bba", "#2a6f9b"];

const CHECKLISTS = [
  {
    id: "estructuras-hangar",
    name: "Estructuras de Hangar",
    description: "Orden, seguridad y condiciones visibles en las zonas de estructura de hangar.",
    items: [
      ["ESH-01", "Pasillos, accesos y salidas despejados", "Comprueba que no hay materiales, útiles o residuos que dificulten el paso o una evacuación.", "Retirar el obstáculo y dejar definida la ubicación correcta."],
      ["ESH-02", "Herramientas y equipos almacenados y asegurados", "Revisa carros, escaleras, plataformas, equipos de apoyo y elementos sueltos.", "Reubicar, asegurar o identificar el equipo fuera de estándar."],
      ["ESH-03", "Medios de trabajo en buen estado visible", "Observa protecciones, cables, ruedas, plataformas, señalización y posibles daños evidentes.", "Parar el uso si existe riesgo y trasladar a mantenimiento o cuarentena."],
      ["ESH-04", "Piezas y materiales identificados", "Verifica que el material en proceso, pendiente o retirado está identificado y separado.", "Completar identificación y separar físicamente el material."],
      ["ESH-05", "Zonas de trabajo limpias al finalizar la actividad", "Comprueba que se aplica el principio de limpiar mientras se trabaja y al terminar.", "Realizar limpieza inmediata y acordar responsable de seguimiento."],
    ],
  },
  {
    id: "interiores-hangar",
    name: "Interiores de Hangar",
    description: "Revisión visual de orden, conservación y seguridad en trabajos de interior.",
    items: [
      ["INH-01", "Protecciones y cubiertas colocadas correctamente", "Revisa asientos, paneles, zonas protegidas y elementos desmontados o en intervención.", "Reponer la protección y corregir cualquier montaje provisional."],
      ["INH-02", "Materiales y útiles de interior controlados", "Comprueba que no hay elementos sueltos, sin identificar o fuera de la zona de trabajo.", "Retirar, identificar y devolver el material a su ubicación."],
      ["INH-03", "Iluminación suficiente y zonas de paso seguras", "Observa la iluminación, cables, mangueras y posibles riesgos de tropiezo.", "Asegurar el tendido y solicitar reparación o refuerzo de iluminación."],
      ["INH-04", "Residuos y embalajes retirados", "Verifica que cartón, plásticos, consumibles y residuos no se acumulan en el avión o el puesto.", "Retirar y depositar en el contenedor correspondiente."],
      ["INH-05", "Condición final del puesto documentada", "Comprueba que el área queda lista para el siguiente equipo o turno.", "Completar el relevo con la información y las acciones pendientes."],
    ],
  },
  {
    id: "estructuras-talleres",
    name: "Estructuras de Talleres",
    description: "Control visual de puestos, herramientas, materiales y condiciones de trabajo.",
    items: [
      ["EST-01", "Puesto de trabajo ordenado y visualmente controlado", "Revisa superficies, cajones, carros y zonas de apoyo.", "Definir una ubicación para cada elemento y retirar lo innecesario."],
      ["EST-02", "Herramientas y útiles identificados", "Comprueba identificación, estado y devolución de las herramientas de uso común.", "Etiquetar, inventariar o trasladar el útil a su ubicación."],
      ["EST-03", "Material pendiente de uso separado del material retirado", "Observa piezas, consumibles y elementos desmontados para evitar mezclas.", "Separar y señalizar con el estado correspondiente."],
      ["EST-04", "Puestos y superficies sin daños o condiciones inseguras", "Revisa bordes, suelos, bancos, estanterías y puntos de almacenamiento.", "Aislar el riesgo y comunicar la reparación necesaria."],
      ["EST-05", "Señalización y delimitación visibles", "Comprueba que zonas de trabajo, cuarentena, residuos y equipos están claramente delimitadas.", "Reponer o actualizar la señalización."],
    ],
  },
  {
    id: "ajuste",
    name: "Ajuste",
    description: "Guía visual para orden, útiles de precisión y control del proceso de ajuste.",
    items: [
      ["AJU-01", "Útiles y herramientas de ajuste en su ubicación", "Revisa que calibres, útiles, plantillas y herramientas específicas estén localizados.", "Devolver a su ubicación o actualizar la identificación."],
      ["AJU-02", "Herramientas de medida protegidas y con estado visible", "Observa golpes, suciedad, protección y señales de calibración o control.", "Proteger, limpiar o apartar el equipo para verificación."],
      ["AJU-03", "Virutas, recortes y consumibles retirados", "Comprueba la limpieza de las zonas de corte, taladrado y ajuste.", "Limpiar el puesto y depositar los residuos correctamente."],
      ["AJU-04", "Piezas en proceso claramente identificadas", "Verifica que se distingue lo pendiente, lo aceptado y lo que requiere revisión.", "Completar la identificación y actualizar el estado."],
      ["AJU-05", "Protecciones y EPI disponibles y utilizables", "Revisa disponibilidad, orden y estado visible de las protecciones necesarias.", "Reponer el EPI o retirar el material deteriorado."],
    ],
  },
  {
    id: "materiales-compuestos",
    name: "Materiales Compuestos",
    description: "Control visual de almacenamiento, preparación, consumibles y limpieza del área.",
    items: [
      ["MCO-01", "Materiales almacenados e identificados", "Comprueba identificación, ubicación, estado y separación de los materiales.", "Identificar correctamente y trasladar al almacenamiento establecido."],
      ["MCO-02", "Consumibles y productos con fecha/control visible", "Revisa envases, fechas, etiquetas y condiciones de conservación.", "Retirar el producto no conforme y actualizar el control."],
      ["MCO-03", "Superficies de preparación limpias y protegidas", "Observa mesas, útiles, protecciones y contaminación visible.", "Limpiar, proteger y mantener la superficie preparada."],
      ["MCO-04", "Residuos y materiales contaminados segregados", "Verifica que los residuos se depositan en el recipiente y zona adecuados.", "Segregar y retirar conforme al procedimiento aplicable."],
      ["MCO-05", "Ventilación, EPI y señalización disponibles", "Comprueba visualmente las condiciones de seguridad del puesto.", "Reponer medios o comunicar la deficiencia antes de continuar."],
    ],
  },
  {
    id: "interiores-talleres",
    name: "Interiores de Talleres",
    description: "Revisión de puestos interiores, zonas comunes, almacenamiento y continuidad entre turnos.",
    items: [
      ["INT-01", "Zonas comunes y puestos libres de acumulaciones", "Comprueba mesas, estanterías, taquillas, pasillos y puntos de paso.", "Retirar la acumulación y definir la ubicación adecuada."],
      ["INT-02", "Documentación de trabajo disponible y vigente", "Observa instrucciones, impresos y ayudas visuales en el puesto.", "Retirar la copia obsoleta y colocar la versión vigente."],
      ["INT-03", "Equipos de uso común identificados", "Revisa ordenadores, carros, herramientas y equipos compartidos.", "Identificar el equipo y registrar cualquier anomalía."],
      ["INT-04", "Residuos, embalajes y consumibles bajo control", "Comprueba que las papeleras y contenedores no están desbordados.", "Retirar residuos y solicitar vaciado o reposición."],
      ["INT-05", "Información de relevo visible y útil", "Verifica que las acciones abiertas y los trabajos pendientes se comunican.", "Actualizar el relevo con responsable y fecha objetivo."],
    ],
  },
  {
    id: "limpieza",
    name: "Limpieza",
    description: "Comprobación de limpieza, segregación de residuos y aplicación de clean as you go.",
    items: [
      ["LIM-01", "Suelo y superficies sin suciedad o residuos visibles", "Observa manchas, polvo, virutas, líquidos y elementos pequeños.", "Limpiar de inmediato y eliminar el origen de la suciedad."],
      ["LIM-02", "Herramientas de limpieza disponibles y ordenadas", "Comprueba que los útiles de limpieza están completos, limpios y localizados.", "Reponer, limpiar o identificar los útiles."],
      ["LIM-03", "Residuos segregados en el contenedor correcto", "Revisa contenedores, bolsas, etiquetas y posible mezcla de residuos.", "Segregar correctamente y comunicar el residuo no identificado."],
      ["LIM-04", "No hay restos de trabajo en zonas de difícil visibilidad", "Mira bajo bancos, carros, equipos y alrededor de las áreas de trabajo.", "Completar la limpieza de detalle."],
      ["LIM-05", "Responsabilidad de limpieza del puesto clara", "Comprueba que el equipo conoce cuándo y quién deja el puesto preparado.", "Acordar responsable y añadir la acción al relevo si procede."],
    ],
  },
  {
    id: "pintura",
    name: "Pintura",
    description: "Control visual del área de pintura, productos, protecciones y limpieza del puesto.",
    items: [
      ["PIN-01", "Productos y envases identificados y cerrados", "Revisa etiquetas, tapas, derrames y ubicación de pinturas y disolventes.", "Cerrar, identificar o trasladar el producto a la zona establecida."],
      ["PIN-02", "Protecciones y delimitaciones en buen estado", "Comprueba cabinas, pantallas, protecciones de superficies y zonas señalizadas.", "Reponer la protección y corregir la delimitación."],
      ["PIN-03", "Herramientas de aplicación limpias y controladas", "Observa pistolas, boquillas, recipientes, carros y útiles de aplicación.", "Limpiar, proteger o retirar el útil deteriorado."],
      ["PIN-04", "Ventilación y medios de emergencia accesibles", "Verifica que rejillas, duchas, extintores y accesos no están bloqueados.", "Despejar el acceso y comunicar cualquier anomalía."],
      ["PIN-05", "Residuos y trapos gestionados correctamente", "Comprueba recipientes, tapas, bolsas y retirada de residuos.", "Cerrar el recipiente y gestionar el residuo según corresponda."],
    ],
  },
  {
    id: "laboratorio-end",
    name: "Laboratorio de END",
    description: "Revisión visual del laboratorio de Ensayos No Destructivos y sus zonas de trabajo.",
    items: [
      ["END-01", "Equipos y útiles END identificados y ordenados", "Comprueba equipos de RX, UT, ET, IRT y útiles asociados según corresponda.", "Reubicar, identificar o comunicar la anomalía del equipo."],
      ["END-02", "Consumibles y patrones protegidos y controlados", "Revisa almacenamiento, identificación, estado visible y separación del material.", "Completar identificación y retirar material deteriorado."],
      ["END-03", "Documentación e instrucciones disponibles en el puesto", "Observa que las ayudas de trabajo utilizadas están accesibles y controladas.", "Retirar copia obsoleta y solicitar o colocar la vigente."],
      ["END-04", "Zonas de RX y equipos con accesos despejados", "Comprueba visualmente accesos, señalización, interbloqueos visibles y elementos de seguridad.", "Despejar, señalizar y comunicar cualquier deficiencia de seguridad."],
      ["END-05", "Registros, trabajos pendientes y cuarentena identificados", "Verifica que el estado de las piezas, registros y pendientes se entiende en el relevo.", "Actualizar el registro y definir responsable y fecha objetivo."],
    ],
  },
].map((area, index) => ({ ...area, color: AREA_COLORS[index % AREA_COLORS.length] }));

let currentInspection = null;
let currentView = "dashboard";
let pendingPhotoItemId = null;
let toastTimer = null;
let photoDbPromise = null;
let photoCache = new Map();
let sharedMode = false;
let sharedUser = null;
let sharedSyncTimer = null;
let sharedSyncBusy = false;
const syncTimers = new Map();
const pendingSync = new Map();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function setConnectionState(state, label, detail = "") {
  const badge = $("#connection-badge");
  const labelElement = $("#connection-label");
  if (badge) {
    badge.className = `connection-badge ${state}`;
    badge.title = detail || label;
  }
  if (labelElement) labelElement.textContent = label;
  const privacyTitle = $("#privacy-title");
  const privacyCopy = $("#privacy-copy");
  if (!privacyTitle || !privacyCopy) return;
  if (state === "shared") {
    privacyTitle.textContent = "Historial compartido";
    privacyCopy.textContent = `Las revisiones, medidas y fotografías se sincronizan para todo el equipo${sharedUser?.email ? ` · ${sharedUser.email}` : ""}.`;
  } else if (state === "error") {
    privacyTitle.textContent = "Sin conexión compartida";
    privacyCopy.textContent = "Los cambios se guardan temporalmente en este dispositivo y se volverán a sincronizar al recuperar la conexión.";
  } else if (state === "local") {
    privacyTitle.textContent = "Modo local";
    privacyCopy.textContent = "La conexión compartida aún no está disponible. Los datos permanecen únicamente en este dispositivo.";
  } else {
    privacyTitle.textContent = "Preparando sincronización";
    privacyCopy.textContent = "Comprobando la conexión compartida de la aplicación.";
  }
  updateSaveIndicator("saved");
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...options, headers, cache: "no-store" });
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = { message: raw };
  }
  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function queueInspectionSync(inspection, delay = 400) {
  if (!sharedMode || !inspection?.id) return;
  pendingSync.set(inspection.id, inspection);
  const existingTimer = syncTimers.get(inspection.id);
  if (existingTimer) clearTimeout(existingTimer);
  const timer = setTimeout(() => {
    syncTimers.delete(inspection.id);
    const latest = pendingSync.get(inspection.id) || inspection;
    syncInspectionToServer(latest);
  }, delay);
  syncTimers.set(inspection.id, timer);
}

async function syncInspectionToServer(inspection) {
  if (!sharedMode || !inspection?.id) return null;
  const pendingTimer = syncTimers.get(inspection.id);
  if (pendingTimer) clearTimeout(pendingTimer);
  syncTimers.delete(inspection.id);
  pendingSync.set(inspection.id, inspection);
  try {
    const result = await apiRequest("/api/inspections", {
      method: "POST",
      body: JSON.stringify(inspection),
    });
    const photosSynced = await uploadPendingPhotos(inspection);
    if (!photosSynced) throw new Error("Hay fotografías pendientes de sincronizar.");
    pendingSync.delete(inspection.id);
    setConnectionState("shared", "Historial compartido", "La información se está sincronizando para todo el equipo.");
    return result?.inspection || null;
  } catch (error) {
    pendingSync.set(inspection.id, inspection);
    if (!syncTimers.has(inspection.id)) {
      const retryTimer = setTimeout(() => {
        syncTimers.delete(inspection.id);
        const latest = pendingSync.get(inspection.id);
        if (latest) syncInspectionToServer(latest);
      }, 15000);
      syncTimers.set(inspection.id, retryTimer);
    }
    setConnectionState("error", "Sin conexión", error.message);
    return null;
  }
}

async function syncFromServer({ initial = false } = {}) {
  if (!sharedMode || sharedSyncBusy) return false;
  sharedSyncBusy = true;
  try {
    const pending = Array.from(pendingSync.values());
    for (const inspection of pending) await syncInspectionToServer(inspection);
    const payload = await apiRequest("/api/inspections");
    const serverInspections = (payload?.inspections || []).map(normaliseInspection);
    const localInspections = readInspections();
    const localDraft = readDraft();
    const serverIds = new Set(serverInspections.map((inspection) => inspection.id));
    const localOnly = [...localInspections, ...(localDraft ? [localDraft] : [])]
      .filter((inspection, index, list) => list.findIndex((candidate) => candidate.id === inspection.id) === index)
      .filter((inspection) => !serverIds.has(inspection.id));

    // Conserva y sube los datos locales que existían antes de activar la versión compartida.
    if (initial && localOnly.length) {
      for (const inspection of localOnly) await syncInspectionToServer(inspection);
    }

    const merged = new Map(serverInspections.map((inspection) => [inspection.id, inspection]));
    localOnly.forEach((inspection) => merged.set(inspection.id, inspection));
    pendingSync.forEach((inspection) => merged.set(inspection.id, inspection));
    const stamp = (inspection) => inspection.serverUpdatedAt || inspection.updatedAt || inspection.createdAt || "";
    const ordered = Array.from(merged.values()).sort((a, b) => String(stamp(b)).localeCompare(String(stamp(a))));
    writeInspections(ordered);

    if (localDraft) {
      const remoteDraft = ordered.find((inspection) => inspection.id === localDraft.id);
      const remoteStamp = remoteDraft?.serverUpdatedAt || remoteDraft?.updatedAt || "";
      const localStamp = localDraft.serverUpdatedAt || localDraft.updatedAt || "";
      if (remoteDraft && String(remoteStamp) >= String(localStamp)) writeDraft(remoteDraft);
    }

    setConnectionState("shared", "Historial compartido", "Las revisiones se sincronizan automáticamente.");
    if (currentView === "dashboard") renderDashboard();
    if (currentView === "history") renderHistory();
    if (currentView === "actions") renderActions();
    return true;
  } catch (error) {
    setConnectionState("error", "Sin conexión", error.message);
    if (initial && error.status === 401) setConnectionState("local", "Acceso pendiente", "Protege la aplicación con Cloudflare Access para activar el historial común.");
    return false;
  } finally {
    sharedSyncBusy = false;
  }
}

async function initialiseSharedMode() {
  setConnectionState("connecting", "Conectando…");
  try {
    const payload = await apiRequest("/api/me");
    sharedUser = payload?.user || null;
    sharedMode = true;
    setConnectionState("shared", "Historial compartido", "Las revisiones se sincronizan automáticamente.");
    const connected = await syncFromServer({ initial: true });
    if (!connected) {
      sharedMode = false;
      if (!$("#connection-badge")?.classList.contains("local")) {
        setConnectionState("local", "Modo local", "La base compartida todavía no está disponible; los cambios permanecerán en este dispositivo.");
      }
      return;
    }
    if (!sharedSyncTimer) sharedSyncTimer = setInterval(() => syncFromServer(), 15000);
  } catch (error) {
    sharedMode = false;
    setConnectionState(error.status === 401 ? "local" : "error", error.status === 401 ? "Acceso pendiente" : "Sin conexión", error.message);
  }
}

function uid(prefix = "id") {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, withYear = true) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date).replaceAll(" de ", " ");
}

function areaById(id) {
  return CHECKLISTS.find((area) => area.id === id);
}

function statusInfo(status) {
  return STATUS[status] || STATUS.pending;
}

function cloneGuide(areaId) {
  const area = areaById(areaId);
  return (area?.items || []).map(([code, title, guidance, actionHint]) => ({
    id: uid("item"),
    code,
    title,
    guidance,
    actionHint,
    status: "pending",
    note: "",
    action: "",
    owner: "",
    dueDate: "",
    actionStatus: "",
    closedAt: "",
    closureNote: "",
    photos: [],
    custom: false,
    open: false,
  }));
}

function newInspection(areaId = "") {
  return {
    id: uid("inspection"),
    status: "draft",
    areaId,
    areaName: areaById(areaId)?.name || "",
    date: todayISO(),
    inspector: "",
    location: "",
    shift: "",
    generalNotes: "",
    items: areaId ? cloneGuide(areaId) : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function readInspections() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.inspections) || "[]");
    return Array.isArray(value) ? value.map(normaliseInspection) : [];
  } catch {
    return [];
  }
}

function writeInspections(inspections) {
  localStorage.setItem(STORAGE_KEYS.inspections, JSON.stringify(inspections));
}

function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) || "null");
    return draft && typeof draft === "object" ? normaliseInspection(draft) : null;
  } catch {
    return null;
  }
}

function normaliseInspection(rawInspection) {
  const inspection = { ...rawInspection };
  inspection.items = Array.isArray(rawInspection.items)
    ? rawInspection.items.map((rawItem) => {
      const item = { ...rawItem };
      const isFinding = ["improve", "critical"].includes(item.status);
      item.status = item.status || "pending";
      item.photos = Array.isArray(item.photos) ? item.photos : [];
      item.actionStatus = isFinding ? (item.actionStatus || "open") : "";
      item.closedAt = item.closedAt || "";
      item.closureNote = item.closureNote || "";
      item.custom = Boolean(item.custom);
      return item;
    })
    : [];
  return inspection;
}

function writeDraft(inspection) {
  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(inspection));
}

function removeDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

function saveCurrentInspection({ asCompleted = false } = {}) {
  if (!currentInspection) return;
  currentInspection.updatedAt = new Date().toISOString();
  if (asCompleted) {
    currentInspection.status = "completed";
    currentInspection.completedAt = new Date().toISOString();
    const inspections = readInspections().filter((inspection) => inspection.id !== currentInspection.id);
    inspections.unshift(structuredCloneSafe(currentInspection));
    writeInspections(inspections);
    removeDraft();
  } else if (currentInspection.status === "completed") {
    // Al editar una revisión ya finalizada, se actualiza la entrada existente
    // sin crear un borrador duplicado en el historial.
    const inspections = readInspections().map((inspection) => (
      inspection.id === currentInspection.id ? structuredCloneSafe(currentInspection) : inspection
    ));
    writeInspections(inspections);
  } else {
    currentInspection.status = "draft";
    writeDraft(currentInspection);
  }
  queueInspectionSync(currentInspection);
  updateSaveIndicator("saved");
  updateHeaderCount();
}

function structuredCloneSafe(value) {
  if (window.structuredClone) return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function updateSaveIndicator(state = "saved") {
  const element = $("#save-indicator");
  if (!element) return;
  element.classList.toggle("saving", state === "saving");
  const savedLabel = sharedMode ? "Sincronizado con el equipo" : "Guardado localmente";
  element.innerHTML = state === "saving"
    ? '<span class="save-dot"></span> Guardando…'
    : `<span class="save-dot"></span> ${savedLabel}`;
}

function showToast(message) {
  const element = $("#toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 3300);
}

function setView(view) {
  currentView = view;
  $("#view-dashboard").classList.toggle("hidden", view !== "dashboard");
  $("#view-inspection").classList.toggle("hidden", view !== "inspection");
  $("#view-history").classList.toggle("hidden", view !== "history");
  $("#view-actions").classList.toggle("hidden", view !== "actions");
  $("#btn-nav-dashboard").classList.toggle("active", view === "dashboard");
  $("#btn-nav-history").classList.toggle("active", view === "history");
  $("#btn-nav-actions").classList.toggle("active", view === "actions");
  if (view === "dashboard") renderDashboard();
  if (view === "history") renderHistory();
  if (view === "actions") renderActions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function populateAreaSelects() {
  const optionHtml = CHECKLISTS.map((area) => `<option value="${area.id}">${escapeHtml(area.name)}</option>`).join("");
  $("#quick-area-select").insertAdjacentHTML("beforeend", optionHtml);
  $("#inspection-area").innerHTML = `<option value="">Selecciona un área…</option>${optionHtml}`;
  $("#action-area-filter").insertAdjacentHTML("beforeend", optionHtml);
}

function renderAreaButtons() {
  $("#area-list").innerHTML = CHECKLISTS.map((area) => `
    <button class="area-button" type="button" data-area-id="${area.id}" style="--area-color:${area.color}">
      <span class="area-dot" aria-hidden="true"></span>
      <span>${escapeHtml(area.name)}</span>
    </button>
  `).join("");
}

function renderDashboard() {
  const inspections = readInspections();
  const draft = readDraft();
  const all = draft ? [draft, ...inspections.filter((item) => item.id !== draft.id)] : inspections;
  const completed = inspections.filter((item) => item.status === "completed");
  const openMeasures = getActionRecords().filter((record) => record.item.actionStatus !== "closed").length;

  $("#metric-total").textContent = completed.length;
  $("#metric-open").textContent = openMeasures;
  $("#metric-last").textContent = completed[0] ? formatDate(completed[0].date, false) : "—";

  const recent = all.slice(0, 5);
  if (!recent.length) {
    $("#dashboard-recent").innerHTML = '<div class="recent-empty">Todavía no hay revisiones guardadas.<br />Empieza seleccionando un área.</div>';
  } else {
    $("#dashboard-recent").innerHTML = recent.map((inspection) => recentRowHtml(inspection)).join("");
  }
  $("#dashboard-actions-count").textContent = openMeasures;
  updateHeaderCount();
}

function recentRowHtml(inspection) {
  const areaName = inspection.areaName || areaById(inspection.areaId)?.name || "Sin área";
  const status = inspection.status === "completed" ? "completed" : "draft";
  const statusLabel = inspection.status === "completed" ? "Finalizada" : "Borrador";
  return `
    <button class="recent-row" type="button" data-open-inspection="${inspection.id}">
      <span class="recent-main">
        <strong>${escapeHtml(areaName)}</strong>
        <small>${formatDate(inspection.date)} · ${escapeHtml(inspection.inspector || "Sin inspector")}</small>
      </span>
      <span class="status-pill ${status}">${statusLabel}</span>
    </button>
  `;
}

function updateHeaderCount() {
  const count = readInspections().length + (readDraft() ? 1 : 0);
  $("#history-count").textContent = count;
  const openActions = getActionRecords().filter((record) => record.item.actionStatus !== "closed").length;
  $("#actions-count").textContent = openActions;
  $("#dashboard-actions-count").textContent = openActions;
}

function startNewInspection(areaId = "") {
  const existingDraft = readDraft();
  if (existingDraft && (existingDraft.items?.some((item) => item.status !== "pending" || item.note || item.action || item.photos?.length))) {
    const continueDraft = window.confirm("Tienes un borrador guardado. ¿Quieres continuar con él?\n\nPulsa Cancelar para iniciar una revisión nueva.");
    if (continueDraft) {
      openInspection(existingDraft);
      return;
    }
  }
  currentInspection = newInspection(areaId);
  writeDraft(currentInspection);
  queueInspectionSync(currentInspection, 0);
  openInspection(currentInspection);
}

async function openInspection(inspection) {
  currentInspection = structuredCloneSafe(inspection);
  if (!currentInspection.items?.length && currentInspection.areaId) currentInspection.items = cloneGuide(currentInspection.areaId);
  $("#inspection-kicker").textContent = currentInspection.status === "completed" ? "REVISIÓN FINALIZADA" : "NUEVA REVISIÓN";
  $("#inspection-area").value = currentInspection.areaId || "";
  $("#inspection-date").value = currentInspection.date || todayISO();
  $("#inspection-inspector").value = currentInspection.inspector || "";
  $("#inspection-location").value = currentInspection.location || "";
  $("#inspection-shift").value = currentInspection.shift || "";
  $("#inspection-general-notes").value = currentInspection.generalNotes || "";
  updateInspectionTitle();
  renderChecklist();
  setView("inspection");
  if (currentInspection.status === "completed") {
    showToast("Revisión cargada. Puedes corregirla y volver a generar el informe.");
  }
}

function updateInspectionTitle() {
  const area = areaById(currentInspection?.areaId);
  $("#inspection-title").textContent = area?.name || "Selecciona un área";
}

function handleAreaChange(areaId) {
  if (!currentInspection) return;
  const previousArea = currentInspection.areaId;
  const hasProgress = currentInspection.items?.some((item) => item.status !== "pending" || item.note || item.action || item.photos?.length);
  if (previousArea && previousArea !== areaId && hasProgress) {
    const proceed = window.confirm("Cambiar de área sustituirá la guía actual y sus puntos. ¿Continuar?");
    if (!proceed) {
      $("#inspection-area").value = previousArea;
      return;
    }
  }
  currentInspection.areaId = areaId;
  currentInspection.areaName = areaById(areaId)?.name || "";
  currentInspection.items = cloneGuide(areaId);
  updateInspectionTitle();
  renderChecklist();
  saveCurrentInspection();
}

function syncMetaFromForm() {
  if (!currentInspection) return;
  currentInspection.date = $("#inspection-date").value;
  currentInspection.inspector = $("#inspection-inspector").value.trim();
  currentInspection.location = $("#inspection-location").value.trim();
  currentInspection.shift = $("#inspection-shift").value;
  currentInspection.generalNotes = $("#inspection-general-notes").value.trim();
}

function getFindings(inspection = currentInspection) {
  return (inspection?.items || []).filter((item) => item.status === "improve" || item.status === "critical" || item.status === "pending");
}

function isActionFinding(item) {
  return ["improve", "critical"].includes(item?.status);
}

function actionStatusInfo(status) {
  return ACTION_STATUS[status] || ACTION_STATUS.open;
}

function getActionRecords() {
  const draft = readDraft();
  const saved = readInspections();
  const sources = draft ? [draft, ...saved.filter((inspection) => inspection.id !== draft.id)] : saved;
  return sources.flatMap((inspection) => (inspection.items || [])
    .filter((item) => isActionFinding(item))
    .map((item) => ({ inspectionId: inspection.id, inspection, item })));
}

function getOpenActions(inspection) {
  return (inspection?.items || []).filter((item) => isActionFinding(item) && item.actionStatus !== "closed");
}

function renderChecklist() {
  const container = $("#checklist-container");
  if (!currentInspection?.areaId) {
    container.innerHTML = '<div class="recent-empty">Selecciona un área para cargar la guía de comprobación.</div>';
    updateProgress();
    renderLiveSummary();
    return;
  }
  const items = currentInspection.items || [];
  container.innerHTML = items.map((item, index) => itemHtml(item, index)).join("");
  hydratePhotoThumbs();
  updateProgress();
  renderLiveSummary();
}

function itemHtml(item, index) {
  const info = statusInfo(item.status);
  const hasDetails = item.open || item.status !== "pending" || item.note || item.action || item.owner || item.dueDate || item.photos?.length;
  const statusOptions = Object.entries(STATUS).map(([value, status]) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${status.label}</option>`).join("");
  const actionStatus = item.actionStatus || "open";
  const actionStatusOptions = Object.entries(ACTION_STATUS).map(([value, status]) => `<option value="${value}" ${actionStatus === value ? "selected" : ""}>${status.label}</option>`).join("");
  const titleContent = item.custom
    ? `<input class="custom-title-input" type="text" value="${escapeHtml(item.title)}" placeholder="Escribe el punto a revisar…" data-item-id="${item.id}" data-item-field="title" aria-label="Título del punto personalizado" />
       <button class="custom-remove" type="button" data-action="remove-item" data-item-id="${item.id}">Eliminar punto personalizado</button>`
    : `<h3>${escapeHtml(item.title)}</h3>`;
  return `
    <article class="check-item ${info.className === "ok" ? "status-ok" : `status-${info.className}`} ${item.custom ? "custom-item" : ""}" data-item-id="${item.id}">
      <div class="item-main-row">
        <span class="item-number">${String(index + 1).padStart(2, "0")}</span>
        <div class="item-copy">
          ${titleContent}
          <p>${escapeHtml(item.guidance || "Añade una observación cuando sea necesario.")}</p>
        </div>
        <select class="item-status status-select-${info.className}" data-item-id="${item.id}" data-action="status" aria-label="Estado del punto ${index + 1}">
          ${statusOptions}
        </select>
        <button class="item-toggle" type="button" data-action="toggle-details" data-item-id="${item.id}">${hasDetails ? "Ocultar detalle" : "Añadir detalle"} <span aria-hidden="true">${hasDetails ? "↑" : "+"}</span></button>
      </div>
      <div class="item-details ${hasDetails ? "" : "hidden-details"}">
        <div class="detail-grid">
          <label class="detail-field-label" for="note-${item.id}">Qué se ha observado</label>
          <textarea id="note-${item.id}" rows="2" data-item-id="${item.id}" data-item-field="note" placeholder="Describe brevemente la situación observada…">${escapeHtml(item.note)}</textarea>
          <div class="detail-row">
            <div>
              <label class="detail-field-label" for="action-${item.id}">Medida / acción propuesta</label>
              <textarea id="action-${item.id}" rows="2" data-item-id="${item.id}" data-item-field="action" placeholder="Qué hay que hacer para corregir o mantener el estándar…">${escapeHtml(item.action)}</textarea>
            </div>
            <div>
              <label class="detail-field-label" for="hint-${item.id}">Pista para la medida</label>
              <textarea id="hint-${item.id}" rows="2" readonly>${escapeHtml(item.actionHint || "Concretar la acción y su seguimiento.")}</textarea>
            </div>
          </div>
          <div class="detail-row">
            <div>
              <label class="detail-field-label" for="owner-${item.id}">Responsable</label>
              <input id="owner-${item.id}" type="text" value="${escapeHtml(item.owner)}" data-item-id="${item.id}" data-item-field="owner" placeholder="Persona / equipo" />
            </div>
            <div>
              <label class="detail-field-label" for="due-${item.id}">Fecha objetivo</label>
              <input id="due-${item.id}" type="date" value="${escapeHtml(item.dueDate)}" data-item-id="${item.id}" data-item-field="dueDate" />
            </div>
          </div>
          ${isActionFinding(item) ? `
            <div class="action-tracking-box">
              <div class="detail-row">
                <div>
                  <label class="detail-field-label" for="action-status-${item.id}">Seguimiento de la medida</label>
                  <select id="action-status-${item.id}" class="action-status-select ${actionStatusInfo(actionStatus).className}" data-item-id="${item.id}" data-action="item-action-status">
                    ${actionStatusOptions}
                  </select>
                </div>
                <div>
                  <label class="detail-field-label" for="closed-at-${item.id}">Fecha de cierre</label>
                  <input id="closed-at-${item.id}" type="date" value="${escapeHtml(item.closedAt || "")}" data-item-id="${item.id}" data-item-field="closedAt" />
                </div>
              </div>
              <label class="detail-field-label" for="closure-note-${item.id}">Comentario de cierre / verificación</label>
              <textarea id="closure-note-${item.id}" rows="2" data-item-id="${item.id}" data-item-field="closureNote" placeholder="Indica cómo se ha comprobado que la acción está realizada…">${escapeHtml(item.closureNote || "")}</textarea>
            </div>
          ` : ""}
          <div class="photo-area">
            <div class="photo-list" data-photo-list="${item.id}"></div>
            <button class="photo-add" type="button" data-action="add-photo" data-item-id="${item.id}"><span aria-hidden="true">▧</span> Adjuntar imagen</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function updateProgress() {
  const items = currentInspection?.items || [];
  const total = items.length;
  const done = items.filter((item) => item.status !== "pending").length;
  const counts = items.reduce((result, item) => {
    result[item.status] = (result[item.status] || 0) + 1;
    return result;
  }, {});
  const percent = total ? Math.round((done / total) * 100) : 0;
  $("#progress-text").textContent = `${done} de ${total} puntos completados`;
  $("#progress-bar").style.width = `${percent}%`;
  $("#count-ok").textContent = counts.ok || 0;
  $("#count-improve").textContent = counts.improve || 0;
  $("#count-critical").textContent = counts.critical || 0;
  $("#count-na").textContent = counts.na || 0;
}

function renderLiveSummary() {
  const findings = getFindings().filter((item) => item.status !== "na");
  $("#summary-count").textContent = findings.filter((item) => ["improve", "critical"].includes(item.status)).length;
  const container = $("#live-findings-list");
  if (!findings.length) {
    container.innerHTML = '<div class="live-empty">Las medidas y puntos pendientes aparecerán aquí mientras avanzas.</div>';
    return;
  }
  container.innerHTML = findings.map((item) => {
    const info = statusInfo(item.status);
    return `
      <div class="finding-row">
        <div class="finding-row-top">
          <strong>${escapeHtml(item.title || "Punto personalizado")}</strong>
          <span class="status-pill ${info.className}">${info.short}</span>
        </div>
        <p>${escapeHtml(item.action || item.note || "Pendiente de completar")}</p>
      </div>
    `;
  }).join("");
}

function updateItem(itemId, field, value) {
  const item = currentInspection?.items?.find((candidate) => candidate.id === itemId);
  if (!item) return;
  const previousStatus = item.status;
  item[field] = value;
  currentInspection.updatedAt = new Date().toISOString();
  if (field === "status") {
    if (isActionFinding(value)) {
      item.actionStatus = item.actionStatus || "open";
    } else if (!isActionFinding(previousStatus)) {
      item.actionStatus = "";
      item.closedAt = "";
      item.closureNote = "";
    } else {
      item.actionStatus = "";
      item.closedAt = "";
    }
    item.open = value !== "pending" || item.open;
    renderChecklist();
  } else if (field === "actionStatus") {
    if (value === "closed") {
      item.closedAt = item.closedAt || todayISO();
    } else {
      item.closedAt = "";
    }
    renderChecklist();
  } else {
    renderLiveSummary();
  }
  updateSaveIndicator("saving");
  clearTimeout(updateItem.saveTimer);
  updateItem.saveTimer = setTimeout(() => saveCurrentInspection(), 250);
}

async function hydratePhotoThumbs() {
  const nodes = $$(`[data-photo-list]`);
  for (const list of nodes) {
    const item = currentInspection?.items?.find((candidate) => candidate.id === list.dataset.photoList);
    if (!item) continue;
    const photos = [];
    for (const photoId of item.photos || []) {
      const photo = await getPhoto(photoId);
      if (photo) {
        photoCache.set(photoId, photo);
        photos.push(photo);
      }
    }
    list.innerHTML = photos.map((photo) => `
      <span class="photo-thumb">
        <img src="${photo.dataUrl}" alt="${escapeHtml(photo.name || "Fotografía adjunta")}" />
        <button class="photo-remove" type="button" data-action="remove-photo" data-item-id="${item.id}" data-photo-id="${photo.id}" aria-label="Eliminar fotografía">×</button>
      </span>
    `).join("");
  }
}

function openPhotoPicker(itemId) {
  pendingPhotoItemId = itemId;
  $("#photo-input").value = "";
  $("#photo-input").click();
}

async function handlePhotoFiles(files) {
  const item = currentInspection?.items?.find((candidate) => candidate.id === pendingPhotoItemId);
  if (!item || !files.length) return;
  showToast("Procesando fotografías…");
  if (sharedMode && !await syncInspectionToServer(currentInspection)) {
    showToast("No se ha podido conectar con el historial compartido. La fotografía quedará pendiente de sincronizar.");
  }
  for (const file of files) {
    try {
      const dataUrl = await compressImage(file);
      const localPhoto = { id: uid("photo"), name: file.name, dataUrl, createdAt: new Date().toISOString() };
      let photo = localPhoto;
      if (sharedMode) {
        try {
          const uploaded = await uploadSharedPhoto(dataUrl, file.name, item.id, localPhoto.id, currentInspection.id);
          photo = { ...localPhoto, ...uploaded, dataUrl: uploaded.url };
        } catch (error) {
          await putPhoto(localPhoto);
          setConnectionState("error", "Pendiente de sincronizar", error.message);
          showToast("Fotografía guardada en este dispositivo; se sincronizará al recuperar la conexión.");
        }
      } else {
        await putPhoto(localPhoto);
      }
      item.photos = item.photos || [];
      item.photos.push(photo.id);
      photoCache.set(photo.id, photo);
    } catch {
      showToast("No se ha podido cargar una de las imágenes.");
    }
  }
  item.open = true;
  saveCurrentInspection();
  renderChecklist();
  showToast("Fotografías adjuntadas a la medida.");
}

function dataUrlToBlob(dataUrl) {
  const [header, encoded] = String(dataUrl).split(",");
  const mime = header?.match(/^data:([^;]+)/)?.[1] || "image/jpeg";
  const binary = atob(encoded || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function uploadSharedPhoto(dataUrl, name, itemId, photoId = "", inspectionId = currentInspection?.id) {
  const form = new FormData();
  form.append("file", dataUrlToBlob(dataUrl), name || "fotografia.jpg");
  form.append("inspectionId", inspectionId || "");
  form.append("itemId", itemId);
  if (photoId) form.append("photoId", photoId);
  const payload = await apiRequest("/api/photos", { method: "POST", body: form });
  return {
    ...(payload.photo || {}),
    dataUrl: payload.photo?.url || "",
    createdAt: new Date().toISOString(),
  };
}

async function getLocalPhoto(id) {
  const cached = photoCache.get(id);
  if (cached?.dataUrl?.startsWith("data:")) return cached;
  try {
    const db = await openPhotoDb();
    return await new Promise((resolve, reject) => {
      const request = db.transaction(PHOTO_DB.store, "readonly").objectStore(PHOTO_DB.store).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function uploadPendingPhotos(inspection) {
  if (!sharedMode || !inspection?.items?.length) return true;
  let allUploaded = true;
  for (const item of inspection.items) {
    for (const photoId of item.photos || []) {
      const localPhoto = await getLocalPhoto(photoId);
      if (!localPhoto?.dataUrl?.startsWith("data:")) continue;
      try {
        const uploaded = await uploadSharedPhoto(localPhoto.dataUrl, localPhoto.name, item.id, photoId, inspection.id);
        photoCache.set(photoId, { ...localPhoto, ...uploaded, id: photoId, dataUrl: uploaded.url });
      } catch (error) {
        allUploaded = false;
        setConnectionState("error", "Pendiente de sincronizar", error.message);
      }
    }
  }
  return allUploaded;
}

async function compressImage(file) {
  const maxDimension = 1600;
  const quality = 0.78;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    bitmap = await new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Imagen no válida"));
      };
      image.src = url;
    });
  }
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  if (bitmap.close) bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo comprimir la imagen"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }, "image/jpeg", quality);
  });
}

function openPhotoDb() {
  if (photoDbPromise) return photoDbPromise;
  photoDbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const request = window.indexedDB.open(PHOTO_DB.name, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PHOTO_DB.store)) request.result.createObjectStore(PHOTO_DB.store, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return photoDbPromise;
}

async function putPhoto(photo) {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(PHOTO_DB.store, "readwrite").objectStore(PHOTO_DB.store).put(photo);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getPhoto(id) {
  if (photoCache.has(id)) return photoCache.get(id);
  if (sharedMode) {
    const photo = { id, name: "Fotografía adjunta", url: `/api/photos/${encodeURIComponent(id)}`, dataUrl: `/api/photos/${encodeURIComponent(id)}` };
    photoCache.set(id, photo);
    return photo;
  }
  try {
    const db = await openPhotoDb();
    const photo = await new Promise((resolve, reject) => {
      const request = db.transaction(PHOTO_DB.store, "readonly").objectStore(PHOTO_DB.store).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    if (photo) photoCache.set(id, photo);
    return photo;
  } catch {
    return null;
  }
}

async function getPhotoForReport(id) {
  const photo = await getPhoto(id);
  if (!photo) return null;
  if (photo.dataUrl?.startsWith("data:")) return photo;
  const source = photo.url || photo.dataUrl;
  if (!source) return photo;
  try {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) return null;
    const dataUrl = await blobToDataUrl(await response.blob());
    return { ...photo, dataUrl };
  } catch {
    return null;
  }
}

async function deletePhoto(id) {
  photoCache.delete(id);
  try {
    const db = await openPhotoDb();
    await new Promise((resolve, reject) => {
      const request = db.transaction(PHOTO_DB.store, "readwrite").objectStore(PHOTO_DB.store).delete(id);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
  } catch {
    // La inspección sigue siendo válida aunque el navegador no permita borrar la miniatura.
  }
}

async function removePhotoFromItem(itemId, photoId) {
  const item = currentInspection?.items?.find((candidate) => candidate.id === itemId);
  if (!item) return;
  item.photos = (item.photos || []).filter((id) => id !== photoId);
  if (sharedMode) {
    try {
      await apiRequest(`/api/photos/${encodeURIComponent(photoId)}`, { method: "DELETE" });
    } catch (error) {
      if (error.status !== 404) setConnectionState("error", "Pendiente de sincronizar", error.message);
    }
  }
  await deletePhoto(photoId);
  saveCurrentInspection();
  renderChecklist();
}

function addCustomItem() {
  if (!currentInspection) return;
  currentInspection.items.push({
    id: uid("custom"),
    code: "CUSTOM",
    title: "",
    guidance: "Punto añadido durante la configuración de la guía.",
    actionHint: "Define la medida necesaria y cómo se verificará.",
    status: "pending",
    note: "",
    action: "",
    owner: "",
    dueDate: "",
    photos: [],
    custom: true,
    open: true,
  });
  saveCurrentInspection();
  renderChecklist();
  const lastInput = $(".custom-title-input:last-of-type");
  lastInput?.focus();
}

function removeCustomItem(itemId) {
  const item = currentInspection?.items?.find((candidate) => candidate.id === itemId);
  if (!item?.custom) return;
  currentInspection.items = currentInspection.items.filter((candidate) => candidate.id !== itemId);
  (item.photos || []).forEach((photoId) => {
    if (sharedMode) apiRequest(`/api/photos/${encodeURIComponent(photoId)}`, { method: "DELETE" }).catch(() => {});
    deletePhoto(photoId);
  });
  saveCurrentInspection();
  renderChecklist();
}

function validateBeforeFinish() {
  syncMetaFromForm();
  if (!currentInspection.areaId) {
    showToast("Selecciona el área antes de finalizar.");
    $("#inspection-area").focus();
    return false;
  }
  if (!currentInspection.date || !currentInspection.inspector) {
    showToast("Completa la fecha y el nombre del inspector/a.");
    if (!currentInspection.inspector) $("#inspection-inspector").focus();
    return false;
  }
  const pending = currentInspection.items.filter((item) => item.status === "pending").length;
  if (pending) {
    const proceed = window.confirm(`Hay ${pending} punto${pending === 1 ? "" : "s"} pendiente${pending === 1 ? "" : "s"}. ¿Quieres finalizar de todas formas?`);
    if (!proceed) return false;
  }
  return true;
}

async function finishInspection() {
  if (!validateBeforeFinish()) return;
  saveCurrentInspection({ asCompleted: true });
  if (sharedMode && !await syncInspectionToServer(currentInspection)) {
    showToast("La revisión se ha guardado localmente y se sincronizará al recuperar la conexión.");
  }
  await openReportDialog();
  showToast("Revisión finalizada y guardada en el historial.");
}

async function openReportDialog() {
  if (!currentInspection) return;
  const reportHtml = await buildReportHtml(currentInspection);
  $("#report-preview").innerHTML = reportHtml;
  const dialog = $("#report-dialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeReportDialog() {
  const dialog = $("#report-dialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

async function collectPhotoMap(inspection) {
  const map = new Map();
  for (const item of inspection.items || []) {
    for (const id of item.photos || []) {
      const photo = await getPhotoForReport(id);
      if (photo) map.set(id, photo);
    }
  }
  return map;
}

function reportStatusLabel(status) {
  const info = statusInfo(status);
  return `<span class="report-status-label ${info.className}">${info.label}</span>`;
}

function reportActionStatusLabel(status) {
  const info = actionStatusInfo(status);
  return `<span class="report-action-status ${info.className}">${info.label}</span>`;
}

async function buildReportHtml(inspection) {
  const photoMap = await collectPhotoMap(inspection);
  const area = areaById(inspection.areaId);
  const items = inspection.items || [];
  const findings = items.filter((item) => ["improve", "critical", "pending"].includes(item.status));
  const clean = items.filter((item) => ["ok", "na"].includes(item.status));
  const counts = items.reduce((result, item) => {
    result[item.status] = (result[item.status] || 0) + 1;
    return result;
  }, {});
  const done = items.filter((item) => item.status !== "pending").length;
  const findingsHtml = findings.length
    ? findings.map((item) => {
      const itemStatus = item.status === "critical" ? "critical" : item.status === "pending" ? "pending" : "improve";
      const photos = (item.photos || []).map((id) => photoMap.get(id)).filter(Boolean);
      const action = item.action || "Pendiente de definir";
      const observation = item.note || "Sin observación detallada.";
      const meta = [
        item.owner ? `Responsable: ${escapeHtml(item.owner)}` : "",
        item.dueDate ? `Fecha objetivo: ${escapeHtml(formatDate(item.dueDate))}` : "",
        `Seguimiento: ${reportActionStatusLabel(item.actionStatus)}`,
        item.actionStatus === "closed" && item.closedAt ? `Cerrada: ${escapeHtml(formatDate(item.closedAt))}` : "",
      ].filter(Boolean).join(" · ");
      return `
        <article class="report-finding ${itemStatus}">
          <div class="report-finding-head">
            <h4>${escapeHtml(item.title || "Punto personalizado")}</h4>
            ${reportStatusLabel(item.status)}
          </div>
          <p><strong>Observación:</strong> ${escapeHtml(observation)}</p>
          <div class="report-action">
            <strong>Medida propuesta</strong>
            <p>${escapeHtml(action)}</p>
            ${meta ? `<p class="report-action-meta">${meta}</p>` : ""}
          </div>
          ${photos.length ? `<div class="report-photo-grid">${photos.map((photo) => `<img src="${photo.dataUrl}" alt="${escapeHtml(photo.name || "Fotografía de la observación")}" />`).join("")}</div>` : ""}
        </article>
      `;
    }).join("")
    : '<p class="report-general-notes">No se han registrado medidas ni puntos pendientes en esta revisión.</p>';
  const cleanHtml = clean.length
    ? `<ul class="report-clean-list">${clean.map((item) => `<li>${escapeHtml(item.title)} — ${item.status === "na" ? "No aplica" : "Conforme"}</li>`).join("")}</ul>`
    : '<p class="report-general-notes">No hay puntos conformes o no aplicables registrados.</p>';

  return `
    <div class="report-sheet">
      <div class="report-brand">
        <div>
          <div class="report-brand-mark">GO, LOOK <em>&amp;</em> SEE</div>
          <small>Control visual de talleres</small>
        </div>
        <div class="report-date">Informe generado<br /><strong>${escapeHtml(new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date()))}</strong></div>
      </div>
      <h1 class="report-title">Informe de revisión</h1>
      <p class="report-subtitle">${escapeHtml(area?.name || inspection.areaName || "Área no indicada")}</p>
      <div class="report-meta-grid">
        ${reportMetaBox("Fecha", formatDate(inspection.date))}
        ${reportMetaBox("Inspector/a", inspection.inspector || "No indicado")}
        ${reportMetaBox("Ubicación", inspection.location || "No indicada")}
        ${reportMetaBox("Turno", inspection.shift || "No indicado")}
      </div>
      <div class="report-kpis">
        ${reportKpi("Puntos revisados", `${done} / ${items.length}`)}
        ${reportKpi("Conformes", counts.ok || 0)}
        ${reportKpi("Mejoras", counts.improve || 0)}
        ${reportKpi("Prioritarias", counts.critical || 0)}
      </div>
      ${inspection.generalNotes ? `<h2 class="report-section-title">Observaciones generales</h2><p class="report-general-notes">${escapeHtml(inspection.generalNotes)}</p>` : ""}
      <h2 class="report-section-title">Medidas y puntos pendientes</h2>
      ${findingsHtml}
      <h2 class="report-section-title">Puntos conformes / no aplicables</h2>
      ${cleanHtml}
      <div class="report-footer">Documento generado con la aplicación Go, Look &amp; See. Revisar las acciones propuestas y actualizar el seguimiento según el sistema de gestión aplicable.</div>
    </div>
  `;
}

function reportMetaBox(label, value) {
  return `<div class="report-meta-box"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function reportKpi(label, value) {
  return `<div class="report-kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

async function createReportFile() {
  if (!currentInspection) return;
  const body = await buildReportHtml(currentInspection);
  const fullHtml = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe Go, Look &amp; See</title><style>${reportStandaloneCss()}</style></head><body>${body}</body></html>`;
  const filename = `go-look-see-${slugify(currentInspection.areaName || "revision")}-${currentInspection.date || todayISO()}.html`;
  return new File([fullHtml], filename, { type: "text/html" });
}

async function downloadReport() {
  const file = await createReportFile();
  if (!file) return;
  downloadReportFile(file);
  showToast("Informe descargado. Puedes adjuntarlo al correo.");
}

function downloadReportFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function shareReport() {
  const file = await createReportFile();
  if (!file) return;
  let canShareFile = false;
  try {
    canShareFile = Boolean(navigator.share) && (!navigator.canShare || navigator.canShare({ files: [file] }));
  } catch {
    canShareFile = false;
  }
  if (!canShareFile) {
    await downloadReport();
    showToast("Este navegador no permite compartir adjuntos directamente. Adjunta el archivo descargado al correo.");
    return;
  }
  try {
    await navigator.share({
      title: `Informe Go, Look & See · ${currentInspection.areaName || "Revisión"}`,
      text: "Informe de revisión Go, Look & See",
      files: [file],
    });
    showToast("Informe compartido correctamente.");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("No se ha podido compartir el informe.");
  }
}

function reportStandaloneCss() {
  return `
    :root{font-family:Arial,Helvetica,sans-serif;color:#18243b;background:#eef2f7}
    *{box-sizing:border-box}body{margin:0;padding:25px}
    .report-sheet{max-width:850px;margin:0 auto;padding:38px 42px;background:#fff;color:#18243b}
    .report-brand{padding-bottom:20px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px;border-bottom:3px solid #e32945}
    .report-brand-mark{color:#071d49;font-size:13px;font-weight:850;letter-spacing:.13em}.report-brand-mark em{color:#e32945;font-style:normal}
    .report-brand small{display:block;margin-top:5px;color:#71809a;font-size:9px;letter-spacing:.12em;text-transform:uppercase}
    .report-date{color:#62718b;font-size:11px;text-align:right}.report-title{margin:25px 0 5px;color:#071d49;font-size:29px;letter-spacing:-.04em}.report-subtitle{margin:0;color:#62718b;font-size:13px}
    .report-meta-grid{margin:23px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.report-meta-box{min-height:55px;padding:10px 12px;border-radius:8px;background:#f1f5fb}.report-meta-box span{display:block;margin-bottom:4px;color:#74829a;font-size:9px;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.report-meta-box strong{display:block;color:#071d49;font-size:11px;line-height:1.3;word-break:break-word}
    .report-kpis{margin:0 0 26px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.report-kpi{padding:14px;border:1px solid #e3e9f2;border-top:3px solid #1f5cce;border-radius:8px}.report-kpi:nth-child(2){border-top-color:#17835d}.report-kpi:nth-child(3){border-top-color:#b36a05}.report-kpi:nth-child(4){border-top-color:#e32945}.report-kpi span{display:block;color:#71809a;font-size:9px}.report-kpi strong{display:block;margin-top:5px;color:#071d49;font-size:21px}
    .report-section-title{padding-bottom:8px;border-bottom:1px solid #dbe3ef;color:#071d49;font-size:13px;letter-spacing:.05em;text-transform:uppercase}.report-general-notes{margin:12px 0 23px;padding:12px 14px;border-left:3px solid #9fb6db;background:#f7f9fc;color:#56657c;font-size:11px;line-height:1.5;white-space:pre-wrap}
    .report-finding{margin:14px 0;padding:15px;border:1px solid #e1e7f0;border-left:4px solid #b36a05;border-radius:8px;break-inside:avoid}.report-finding.critical{border-left-color:#e32945}.report-finding.pending{border-left-color:#79879e}.report-finding-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.report-finding h4{margin:0;color:#071d49;font-size:12px;line-height:1.35}.report-status-label{flex-shrink:0;padding:4px 7px;border-radius:5px;font-size:9px;font-weight:800;text-transform:uppercase}.report-status-label.improve{background:#fff6e7;color:#b36a05}.report-status-label.critical{background:#fff0f2;color:#e32945}.report-status-label.pending{background:#eef1f5;color:#65738a}.report-finding p{margin:7px 0 0;color:#5d6b82;font-size:10px;line-height:1.45;white-space:pre-wrap}.report-action{margin-top:11px;padding:10px;border-radius:6px;background:#f6f8fc}.report-action strong{display:block;margin-bottom:4px;color:#3e4e68;font-size:9px;letter-spacing:.06em;text-transform:uppercase}.report-action p{margin:0}.report-action-meta{margin-top:7px!important;color:#75839a!important;font-size:9px!important}.report-action-status{display:inline-block;padding:3px 5px;border-radius:4px;font-size:8px;font-weight:800;text-transform:uppercase}.report-action-status.action-open{background:#fff6e7;color:#b36a05}.report-action-status.action-progress{background:#eaf1ff;color:#1f5cce}.report-action-status.action-closed{background:#eaf8f2;color:#17835d}.report-photo-grid{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.report-photo-grid img{width:100%;aspect-ratio:4/3;display:block;border-radius:5px;object-fit:cover}.report-clean-list{margin:12px 0 25px;padding-left:18px;color:#5d6b82;font-size:10px;line-height:1.55}.report-footer{margin-top:29px;padding-top:15px;border-top:1px solid #dbe3ef;color:#8895a8;font-size:9px;line-height:1.45}
    @media print{body{padding:0;background:#fff}.report-sheet{max-width:none;box-shadow:none}}
    @media(max-width:600px){body{padding:8px}.report-sheet{padding:25px 20px}.report-meta-grid,.report-kpis{grid-template-columns:repeat(2,1fr)}.report-photo-grid{grid-template-columns:repeat(3,1fr)}}
  `;
}

async function printReport() {
  if (!currentInspection) return;
  const body = await buildReportHtml(currentInspection);
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    showToast("El navegador ha bloqueado la ventana de impresión. Permite las ventanas emergentes.");
    return;
  }
  printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe Go, Look &amp; See</title><style>${reportStandaloneCss()}</style></head><body>${body}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

async function openEmail() {
  if (!currentInspection) return;
  const file = await createReportFile();
  if (!file) return;
  const findings = getOpenActions(currentInspection);
  const subject = `Informe Go, Look & See · ${currentInspection.areaName || "Revisión"} · ${formatDate(currentInspection.date)}`;
  const lines = [
    "Buenos días,",
    "",
    "Adjunto el informe de la revisión Go, Look & See realizada con los siguientes datos:",
    `Área: ${currentInspection.areaName || "No indicada"}`,
    `Fecha: ${formatDate(currentInspection.date)}`,
    `Inspector/a: ${currentInspection.inspector || "No indicado"}`,
    `Ubicación: ${currentInspection.location || "No indicada"}`,
    "",
    `Medidas abiertas: ${findings.length}`,
    ...findings.slice(0, 12).map((item, index) => `${index + 1}. [${statusInfo(item.status).short} · ${actionStatusInfo(item.actionStatus).label}] ${item.title} — ${item.action || item.note || "Pendiente de definir"}`),
    "",
    "Un saludo.",
  ];
  if (sharedMode) {
    try {
      const form = new FormData();
      form.append("report", file, file.name);
      form.append("subject", subject);
      form.append("summary", lines.join("\n"));
      await apiRequest("/api/send-report", { method: "POST", body: form });
      showToast("Informe enviado con el archivo adjunto a los destinatarios configurados.");
      return;
    } catch (error) {
      setConnectionState(error.status === 503 ? "shared" : "error", error.status === 503 ? "Historial compartido" : "Correo no disponible", error.message);
    }
  }
  downloadReportFile(file);
  const mailto = `mailto:${RECIPIENTS.join(",")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  window.location.href = mailto;
  showToast("Informe descargado. Adjunta el archivo al correo que se ha abierto.");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "revision";
}

function renderHistory() {
  const draft = readDraft();
  const inspections = readInspections();
  const all = draft ? [draft, ...inspections.filter((item) => item.id !== draft.id)] : inspections;
  const search = $("#history-search").value.trim().toLowerCase();
  const filter = $("#history-filter").value;
  const filtered = all.filter((inspection) => {
    const searchable = [inspection.areaName, inspection.inspector, inspection.location, inspection.date].join(" ").toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesFilter = filter === "all" || (filter === "draft" && inspection.status !== "completed") || (filter === "completed" && inspection.status === "completed");
    return matchesSearch && matchesFilter;
  });
  const container = $("#history-list");
  if (!filtered.length) {
    container.innerHTML = '<div class="history-empty">No hay revisiones que coincidan con la búsqueda.</div>';
    return;
  }
  container.innerHTML = filtered.map((inspection) => historyCardHtml(inspection)).join("");
}

function historyCardHtml(inspection) {
  const isCompleted = inspection.status === "completed";
  const findings = getOpenActions(inspection).length;
  return `
    <article class="history-card">
      <div>
        <h3>${escapeHtml(inspection.areaName || areaById(inspection.areaId)?.name || "Sin área")}</h3>
        <small>${formatDate(inspection.date)} · ${escapeHtml(inspection.inspector || "Sin inspector")} · ${escapeHtml(inspection.location || "Ubicación no indicada")}</small>
      </div>
      <div class="history-card-meta">${isCompleted ? `${findings} medida${findings === 1 ? "" : "s"} abierta${findings === 1 ? "" : "s"}` : "Sin finalizar"}</div>
      <div class="history-card-actions">
        <span class="status-pill ${isCompleted ? "completed" : "draft"}">${isCompleted ? "Finalizada" : "Borrador"}</span>
        <button class="mini-button" type="button" data-open-inspection="${inspection.id}">${isCompleted ? "Abrir" : "Continuar"}</button>
        ${isCompleted ? `<button class="mini-button" type="button" data-report-inspection="${inspection.id}">Informe</button>` : ""}
        <button class="mini-button danger" type="button" data-delete-inspection="${inspection.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderActions() {
  const records = getActionRecords();
  const open = records.filter((record) => record.item.actionStatus === "open").length;
  const inProgress = records.filter((record) => record.item.actionStatus === "in_progress").length;
  const closed = records.filter((record) => record.item.actionStatus === "closed").length;
  $("#actions-open-total").textContent = open;
  $("#actions-progress-total").textContent = inProgress;
  $("#actions-closed-total").textContent = closed;
  $("#actions-count").textContent = open + inProgress;
  $("#dashboard-actions-count").textContent = open + inProgress;

  const search = $("#actions-search").value.trim().toLowerCase();
  const areaFilter = $("#action-area-filter").value;
  const statusFilter = $("#action-filter").value;
  const filtered = records.filter((record) => {
    const { inspection, item } = record;
    const searchable = [inspection.areaName, inspection.inspector, inspection.location, inspection.date, item.title, item.note, item.action, item.owner].join(" ").toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesArea = areaFilter === "all" || inspection.areaId === areaFilter;
    const matchesStatus = statusFilter === "all"
      || (statusFilter === "open" && item.actionStatus !== "closed")
      || item.actionStatus === statusFilter;
    return matchesSearch && matchesArea && matchesStatus;
  });
  $("#actions-result-count").textContent = `${filtered.length} medida${filtered.length === 1 ? "" : "s"}`;
  const container = $("#actions-list");
  if (!filtered.length) {
    container.innerHTML = records.length
      ? '<div class="history-empty">No hay medidas que coincidan con los filtros seleccionados.</div>'
      : '<div class="history-empty">Todavía no hay medidas abiertas. Cuando marques un punto como mejora o acción prioritaria aparecerá aquí.</div>';
    return;
  }
  container.innerHTML = filtered.map((record) => actionCardHtml(record)).join("");
}

function actionCardHtml(record) {
  const { inspection, item } = record;
  const severity = statusInfo(item.status);
  const tracking = actionStatusInfo(item.actionStatus);
  const actionOptions = Object.entries(ACTION_STATUS).map(([value, info]) => `<option value="${value}" ${item.actionStatus === value ? "selected" : ""}>${info.label}</option>`).join("");
  const photoLabel = item.photos?.length ? `${item.photos.length} fotografía${item.photos.length === 1 ? "" : "s"}` : "Sin fotografías";
  return `
    <article class="action-card ${item.status === "critical" ? "critical" : ""} ${item.actionStatus === "closed" ? "closed" : ""}">
      <div class="action-card-head">
        <div class="action-card-title">
          <span class="action-area-label">${escapeHtml(inspection.areaName || areaById(inspection.areaId)?.name || "Sin área")}</span>
          <h3>${escapeHtml(item.title || "Punto personalizado")}</h3>
          <p class="action-card-meta">${formatDate(inspection.date)} · ${escapeHtml(inspection.inspector || "Sin inspector")} · ${escapeHtml(inspection.location || "Ubicación no indicada")}</p>
        </div>
        <div class="action-severity">
          <span class="status-pill ${severity.className}">${severity.label}</span>
          <span class="action-state ${tracking.className}">${tracking.label}</span>
        </div>
      </div>
      <div class="action-card-body">
        <div class="action-text-box">
          <span>Observación</span>
          <p>${escapeHtml(item.note || "Sin observación detallada.")}</p>
        </div>
        <div class="action-text-box measure">
          <span>Medida propuesta</span>
          <p>${escapeHtml(item.action || "Pendiente de definir")}</p>
        </div>
      </div>
      <div class="action-tracking-grid">
        <div class="action-field">
          <label for="record-status-${inspection.id}-${item.id}">Seguimiento</label>
          <select id="record-status-${inspection.id}-${item.id}" class="${tracking.className}" data-action-record-field="actionStatus" data-inspection-id="${inspection.id}" data-item-id="${item.id}">
            ${actionOptions}
          </select>
        </div>
        <div class="action-field">
          <label for="record-owner-${inspection.id}-${item.id}">Responsable</label>
          <input id="record-owner-${inspection.id}-${item.id}" type="text" value="${escapeHtml(item.owner || "")}" placeholder="Persona / equipo" data-action-record-field="owner" data-inspection-id="${inspection.id}" data-item-id="${item.id}" />
        </div>
        <div class="action-field">
          <label for="record-due-${inspection.id}-${item.id}">Fecha objetivo</label>
          <input id="record-due-${inspection.id}-${item.id}" type="date" value="${escapeHtml(item.dueDate || "")}" data-action-record-field="dueDate" data-inspection-id="${inspection.id}" data-item-id="${item.id}" />
        </div>
        <div class="action-field">
          <label for="record-closed-${inspection.id}-${item.id}">Fecha de cierre</label>
          <input id="record-closed-${inspection.id}-${item.id}" type="date" value="${escapeHtml(item.closedAt || "")}" data-action-record-field="closedAt" data-inspection-id="${inspection.id}" data-item-id="${item.id}" />
        </div>
      </div>
      <div class="action-closure-field action-field">
        <label for="record-note-${inspection.id}-${item.id}">Comentario de cierre / verificación</label>
        <textarea id="record-note-${inspection.id}-${item.id}" rows="2" placeholder="Indica cómo se ha comprobado la realización de la acción…" data-action-record-field="closureNote" data-inspection-id="${inspection.id}" data-item-id="${item.id}">${escapeHtml(item.closureNote || "")}</textarea>
      </div>
      <div class="action-card-footer">
        <small>${photoLabel}${item.closedAt ? ` · Cerrada el ${escapeHtml(formatDate(item.closedAt))}` : ""}</small>
        <button class="mini-button" type="button" data-open-inspection="${inspection.id}">Abrir revisión</button>
      </div>
    </article>
  `;
}

function updateStoredAction(inspectionId, itemId, field, value) {
  const draft = readDraft();
  const isDraft = draft?.id === inspectionId;
  const stored = isDraft ? draft : readInspections().find((inspection) => inspection.id === inspectionId);
  if (!stored) return;
  const item = stored.items?.find((candidate) => candidate.id === itemId);
  if (!item) return;
  if (field === "actionStatus") {
    item.actionStatus = value;
    if (value === "closed") item.closedAt = item.closedAt || todayISO();
    if (value !== "closed") item.closedAt = "";
  } else {
    item[field] = value;
  }
  stored.updatedAt = new Date().toISOString();
  if (isDraft) {
    writeDraft(stored);
  } else {
    writeInspections(readInspections().map((inspection) => inspection.id === inspectionId ? stored : inspection));
  }
  if (currentInspection?.id === inspectionId) {
    const currentItem = currentInspection.items?.find((candidate) => candidate.id === itemId);
    if (currentItem) Object.assign(currentItem, item);
  }
  queueInspectionSync(stored, 0);
  updateHeaderCount();
}

function handleActionRecordInput(event) {
  const target = event.target;
  const field = target.dataset.actionRecordField;
  if (!field) return;
  updateStoredAction(target.dataset.inspectionId, target.dataset.itemId, field, target.value);
}

function handleActionRecordChange(event) {
  const target = event.target;
  const field = target.dataset.actionRecordField;
  if (!field) return;
  updateStoredAction(target.dataset.inspectionId, target.dataset.itemId, field, target.value);
  renderActions();
}

function findInspection(id) {
  const draft = readDraft();
  if (draft?.id === id) return draft;
  return readInspections().find((inspection) => inspection.id === id) || null;
}

async function openStoredReport(id) {
  const inspection = findInspection(id);
  if (!inspection) return;
  currentInspection = structuredCloneSafe(inspection);
  await openReportDialog();
}

async function deleteInspection(id) {
  const inspection = findInspection(id);
  if (!inspection) return;
  if (!window.confirm(`¿Eliminar esta revisión y sus fotografías${sharedMode ? " para todo el equipo" : " del dispositivo"}? Esta acción no se puede deshacer desde la aplicación.`)) return;
  if (sharedMode) {
    try {
      await apiRequest(`/api/inspections/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      if (error.status !== 404) {
        setConnectionState("error", "Sin conexión", error.message);
        showToast("No se ha podido eliminar la revisión del historial compartido.");
        return;
      }
    }
  }
  const photoIds = (inspection.items || []).flatMap((item) => item.photos || []);
  await Promise.all(photoIds.map((photoId) => deletePhoto(photoId)));
  if (readDraft()?.id === id) removeDraft();
  writeInspections(readInspections().filter((item) => item.id !== id));
  renderHistory();
  updateHeaderCount();
  renderDashboard();
  showToast(sharedMode ? "Revisión eliminada del historial compartido." : "Revisión eliminada del dispositivo.");
}

function handleDelegatedClick(event) {
  const target = event.target.closest("button");
  if (!target) return;
  const areaId = target.dataset.areaId;
  if (areaId) {
    startNewInspection(areaId);
    return;
  }
  const openId = target.dataset.openInspection;
  if (openId) {
    const inspection = findInspection(openId);
    if (inspection) openInspection(inspection);
    return;
  }
  const reportId = target.dataset.reportInspection;
  if (reportId) {
    openStoredReport(reportId);
    return;
  }
  const deleteId = target.dataset.deleteInspection;
  if (deleteId) {
    deleteInspection(deleteId);
    return;
  }
  const action = target.dataset.action;
  const itemId = target.dataset.itemId;
  if (action === "toggle-details") {
    const item = currentInspection?.items?.find((candidate) => candidate.id === itemId);
    if (!item) return;
    item.open = !item.open;
    renderChecklist();
  } else if (action === "add-photo") {
    openPhotoPicker(itemId);
  } else if (action === "remove-photo") {
    removePhotoFromItem(itemId, target.dataset.photoId);
  } else if (action === "remove-item") {
    removeCustomItem(itemId);
  }
}

function handleDelegatedInput(event) {
  const target = event.target;
  const itemId = target.dataset.itemId;
  const field = target.dataset.itemField;
  if (!itemId || !field) return;
  updateItem(itemId, field, target.value);
}

function handleDelegatedChange(event) {
  const target = event.target;
  if (target.dataset.action === "status") {
    updateItem(target.dataset.itemId, "status", target.value);
  } else if (target.dataset.action === "item-action-status") {
    updateItem(target.dataset.itemId, "actionStatus", target.value);
  }
}

function wireEvents() {
  $("#btn-brand").addEventListener("click", () => setView("dashboard"));
  $("#btn-nav-dashboard").addEventListener("click", () => setView("dashboard"));
  $("#btn-nav-history").addEventListener("click", () => setView("history"));
  $("#btn-nav-actions").addEventListener("click", () => setView("actions"));
  $("#btn-new-top").addEventListener("click", () => startNewInspection());
  $("#btn-new-history").addEventListener("click", () => startNewInspection());
  $("#btn-new-actions").addEventListener("click", () => startNewInspection());
  $("#btn-see-history").addEventListener("click", () => setView("history"));
  $("#btn-see-actions").addEventListener("click", () => setView("actions"));
  $("#btn-back-dashboard").addEventListener("click", () => {
    saveCurrentInspection();
    setView("dashboard");
  });
  $("#quick-start-form").addEventListener("submit", (event) => {
    event.preventDefault();
    startNewInspection($("#quick-area-select").value);
  });
  $("#inspection-area").addEventListener("change", (event) => handleAreaChange(event.target.value));
  $("#inspection-meta-form").addEventListener("input", () => {
    syncMetaFromForm();
    updateSaveIndicator("saving");
    clearTimeout(syncMetaFromForm.timer);
    syncMetaFromForm.timer = setTimeout(() => saveCurrentInspection(), 250);
  });
  $("#inspection-meta-form").addEventListener("change", () => {
    syncMetaFromForm();
    saveCurrentInspection();
  });
  $("#btn-add-item").addEventListener("click", addCustomItem);
  $("#btn-save-draft").addEventListener("click", () => {
    syncMetaFromForm();
    saveCurrentInspection();
    showToast("Borrador guardado en este dispositivo.");
  });
  $("#btn-finish-inspection").addEventListener("click", finishInspection);
  $("#btn-preview-report").addEventListener("click", async () => {
    syncMetaFromForm();
    saveCurrentInspection();
    await openReportDialog();
  });
  $("#btn-close-report").addEventListener("click", closeReportDialog);
  $("#report-dialog").addEventListener("click", (event) => {
    if (event.target === $("#report-dialog")) closeReportDialog();
  });
  $("#btn-report-download").addEventListener("click", downloadReport);
  $("#btn-report-share").addEventListener("click", shareReport);
  $("#btn-report-print").addEventListener("click", printReport);
  $("#btn-report-email").addEventListener("click", openEmail);
  $("#photo-input").addEventListener("change", (event) => handlePhotoFiles(Array.from(event.target.files || [])));
  $("#checklist-container").addEventListener("click", handleDelegatedClick);
  $("#checklist-container").addEventListener("input", handleDelegatedInput);
  $("#checklist-container").addEventListener("change", handleDelegatedChange);
  $("#dashboard-recent").addEventListener("click", handleDelegatedClick);
  $("#area-list").addEventListener("click", handleDelegatedClick);
  $("#history-list").addEventListener("click", handleDelegatedClick);
  $("#actions-list").addEventListener("click", handleDelegatedClick);
  $("#actions-list").addEventListener("input", handleActionRecordInput);
  $("#actions-list").addEventListener("change", handleActionRecordChange);
  $("#history-search").addEventListener("input", renderHistory);
  $("#history-filter").addEventListener("change", renderHistory);
  $("#actions-search").addEventListener("input", renderActions);
  $("#action-area-filter").addEventListener("change", renderActions);
  $("#action-filter").addEventListener("change", renderActions);
}

function initialise() {
  populateAreaSelects();
  renderAreaButtons();
  wireEvents();
  renderDashboard();
  const draft = readDraft();
  if (draft) {
    const area = draft.areaName || areaById(draft.areaId)?.name || "revisión sin área";
    showToast(`Hay un borrador guardado de ${area}.`);
  }
  void initialiseSharedMode();
}

initialise();
