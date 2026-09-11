# Go, Look & See · Talleres

Aplicación web para realizar revisiones Go, Look & See en talleres, documentar observaciones, adjuntar fotografías, abrir medidas y generar un informe resumen.

## Qué incluye

- Selección de las nueve áreas de inspección: Estructuras de Hangar, Interiores de Hangar, Estructuras de Talleres, Ajuste, Materiales Compuestos, Interiores de Talleres, Limpieza, Pintura y Laboratorio de END.
- Guía inicial de cinco puntos por área, editable en `app.js`.
- Estados `Conforme`, `Mejora`, `Acción prioritaria`, `No aplica` y `Pendiente`.
- Observación, medida propuesta, responsable, fecha objetivo y fotografías por punto.
- Botón `Hacer foto` para abrir directamente la cámara del móvil y `Elegir imagen` para seleccionar una imagen existente.
- Apartado global de `Medidas abiertas`, con seguimiento `Abierta`, `En curso` o `Cerrada`.
- Historial común para todos los usuarios autorizados.
- Fotografías compartidas en D1, sin necesidad de contratar R2.
- Informe descargable, imprimible a PDF y compartible.
- Envío del informe como archivo adjunto cuando se configura el servicio de correo.

## Destinatarios configurados

- `acastillome@iberia.es`
- `dcaballero@iberia.es`
- `rhgarcia@iberia.es`
- `cprudencio@iberia.es`
- `jhernandezdo@iberia.es`

## Publicar desde GitHub en Cloudflare Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta.
2. En Cloudflare Pages, crea un proyecto conectado al repositorio.
3. Usa estos valores:
   - Framework preset: `None`.
   - Build command: vacío.
   - Output directory: `.`.
4. Despliega el proyecto. Cloudflare Pages detectará automáticamente la carpeta `functions`.

## Configuración gratuita del historial y las fotografías

La opción gratuita usa una única base de datos D1 para guardar revisiones, medidas y fotografías comprimidas. No hace falta crear un bucket R2, contratar una suscripción R2 ni configurar el binding `PHOTOS`.

### 1. Crear o abrir la base D1

En Cloudflare entra en `Storage & databases` → `D1 SQL Database` y crea o abre `go-look-see-talleres`.

En la consola SQL ejecuta primero el contenido de `migrations/0001_initial.sql` y después el contenido de `migrations/0002_photo_data.sql`. La segunda migración se ejecuta una sola vez.

### 2. Conectar D1 con Pages

En `Workers & Pages` → proyecto `go-look-see-talleres` → `Settings` → `Bindings` → `Add` → `D1 database`:

- Variable name: `DB`
- D1 database: `go-look-see-talleres`

Pulsa `Add binding` y vuelve a desplegar el proyecto. En esta modalidad no entres en `R2 Object Storage`; puedes cerrar esa ventana.

### 3. Comprobar el resultado

Abre la URL `.pages.dev`, inicia sesión con una cuenta permitida y crea una revisión de prueba. Si se muestran las revisiones al abrir `Historial` desde otro dispositivo, D1 está correctamente conectado. Las imágenes nuevas quedarán guardadas en D1 y estarán disponibles para todos los usuarios autorizados.

La aplicación comprime las fotos y limita cada una a aproximadamente 1,4 MB antes de subirla. Esto es necesario para que el modo gratuito sea compatible con el límite de D1. La capacidad total gratuita es limitada; para una gran cantidad de fotografías convendría usar almacenamiento de objetos, pero no es necesario para empezar.

## Variables y correo

En Pages → `Settings` → `Variables and Secrets` puedes configurar:

- `ALLOWED_EMAIL_DOMAIN=iberia.es`
- `ENVIRONMENT=production`
- `MAIL_FROM=Go, Look & See <remitente-verificado@dominio-autorizado>`
- `CLOUDFLARE_ACCOUNT_ID=...`
- `CLOUDFLARE_EMAIL_API_TOKEN=...` como secreto/encrypted variable

El correo automático requiere un remitente verificado y la configuración correspondiente del servicio de correo. Si no está activado o el informe supera el límite de envío, la aplicación descarga el informe y prepara un correo para adjuntarlo manualmente.

## Acceso para el equipo

Protege la URL de Pages con Cloudflare Access. La opción recomendada es Microsoft Entra ID y una política que permita las cuentas del dominio `@iberia.es`.

Con D1 conectado y Access configurado:

- cada revisión se guarda en D1 y no depende del dispositivo;
- las fotos se guardan en D1 y se consultan desde cualquier dispositivo;
- `Medidas abiertas` muestra las acciones de todas las revisiones;
- los cambios de otros usuarios se refrescan aproximadamente cada 15 segundos;
- si se pierde la conexión, el navegador conserva temporalmente los cambios y muestra el estado de sincronización.

## Uso y personalización

También se puede probar localmente abriendo `index.html` o usando un servidor local. En modo local, el historial y las fotos se guardan en el navegador y no se comparten entre dispositivos.

Las guías están en el array `CHECKLISTS` de `app.js`. Cada punto tiene esta estructura:

```js
["CODIGO", "Título del punto", "Qué se debe observar", "Pista para la medida"]
```

Antes de utilizarla como registro operativo, conviene revisar cada pregunta con los responsables de los talleres y adaptar la guía a los procedimientos, estándares y requisitos de Iberia.
