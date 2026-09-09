# Go, Look & See · Talleres

Aplicación web para realizar revisiones Go, Look & See en talleres, documentar observaciones, adjuntar fotografías, abrir medidas y generar un informe resumen.

## Qué incluye

- Selección de las nueve áreas de inspección:
  - Estructuras de Hangar
  - Interiores de Hangar
  - Estructuras de Talleres
  - Ajuste
  - Materiales Compuestos
  - Interiores de Talleres
  - Limpieza
  - Pintura
  - Laboratorio de END
- Guía inicial de cinco puntos por área, editable en `app.js`.
- Estados `Conforme`, `Mejora`, `Acción prioritaria`, `No aplica` y `Pendiente`.
- Observación, medida propuesta, responsable, fecha objetivo y fotografías por punto.
- Apartado global de `Medidas abiertas`, con filtros por área y seguimiento `Abierta`, `En curso` o `Cerrada`.
- Historial común para todos los usuarios autorizados.
- Fotografías compartidas en R2 y revisiones compartidas en D1 cuando se publica en Cloudflare Pages.
- Informe descargable, imprimible a PDF y compartible.
- Envío automático del informe como archivo adjunto cuando se configura Cloudflare Email Service.

## Destinatarios configurados

- `acastillome@iberia.es`
- `dcaballero@iberia.es`
- `rhgarcia@iberia.es`
- `cprudencio@iberia.es`
- `jhernandezdo@iberia.es`

## Estructura del proyecto

```text
index.html                 Interfaz
styles.css                 Diseño responsive
app.js                     Guías, formulario, historial y sincronización
functions/api/             API de Cloudflare Pages
migrations/                Esquema de la base D1
wrangler.toml.example      Ejemplo de bindings de Cloudflare
```

## Publicar desde GitHub en Cloudflare Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. En Cloudflare Pages, crea un proyecto conectado al repositorio.
3. Usa estos valores:
   - Framework preset: `None`.
   - Build command: vacío.
   - Output directory: `.`.
4. Despliega el proyecto. Cloudflare Pages detectará automáticamente la carpeta `functions`.

## Activar el historial compartido

La aplicación funciona en modo local si se abre sin backend. Para que todos vean la misma información, configura estos bindings en el proyecto de Pages:

| Binding | Servicio | Uso |
| --- | --- | --- |
| `DB` | Cloudflare D1 | Revisiones, medidas y usuarios que han actualizado |
| `PHOTOS` | Cloudflare R2 | Fotografías adjuntas |
| `EMAIL` | Cloudflare Email Service | Envío del informe adjunto |

Pasos orientativos con Wrangler:

```bash
npx wrangler d1 create go-look-see-talleres
npx wrangler r2 bucket create go-look-see-talleres-photos
npx wrangler d1 execute go-look-see-talleres --remote --file=migrations/0001_initial.sql
```

Después, en Cloudflare Pages → Settings → Functions → Bindings, asigna la base D1 con el nombre `DB` y el bucket R2 con el nombre `PHOTOS`. Para el correo, verifica un dominio remitente en Cloudflare Email Service y crea el binding `EMAIL`. Define también:

- `ALLOWED_EMAIL_DOMAIN=iberia.es`
- `ENVIRONMENT=production`
- `MAIL_FROM=Go, Look & See <remitente-verificado@dominio-autorizado>`

`wrangler.toml.example` sirve como referencia. No subas credenciales, tokens ni secretos al repositorio.

## Acceso para el equipo

Protege la URL de Pages con Cloudflare Access. La opción recomendada es Microsoft Entra ID y una política que permita las cuentas del dominio `@iberia.es`. Así el navegador recibe la identidad autenticada y la API solo acepta usuarios de ese dominio.

Con el acceso configurado:

- cada revisión se guarda en D1 y deja de depender del dispositivo;
- las fotos se guardan en R2;
- la pestaña `Medidas abiertas` muestra las acciones de todas las revisiones;
- los cambios de otros usuarios se refrescan automáticamente aproximadamente cada 15 segundos;
- si se pierde la conexión, el navegador conserva temporalmente los cambios y muestra el estado de sincronización.

## Informe y correo

El botón `Enviar por correo` intenta enviar un informe HTML autocontenido, con sus fotografías, a los cinco destinatarios configurados. Cloudflare Email Service requiere un remitente verificado y tiene límites de tamaño; si no está activado o el informe es demasiado grande, la aplicación descarga el archivo y abre un correo preparado para adjuntarlo manualmente.

El botón `Imprimir / PDF` permite obtener una versión PDF desde el diálogo de impresión del navegador.

## Uso y personalización

También se puede probar localmente abriendo `index.html` o usando un servidor local. En modo local, el historial se guarda en el navegador y no se comparte entre dispositivos.

Las guías están en el array `CHECKLISTS` de `app.js`. Cada punto tiene esta estructura:

```js
["CODIGO", "Título del punto", "Qué se debe observar", "Pista para la medida"]
```

Antes de utilizarla como registro operativo, conviene revisar cada pregunta con los responsables de los talleres y adaptar la guía a los procedimientos, estándares y requisitos de Iberia.

