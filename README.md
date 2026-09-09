# Go, Look & See · Talleres

Aplicación web estática para realizar revisiones Go, Look & See en talleres, documentar observaciones, adjuntar fotografías y preparar un informe resumen.

## Incluye

- Selección del área a inspeccionar:
  - Estructuras de Hangar
  - Interiores de Hangar
  - Estructuras de Talleres
  - Ajuste
  - Materiales Compuestos
  - Interiores de Talleres
  - Limpieza
  - Pintura
  - Laboratorio de END
- Guía inicial de cinco puntos por área.
- Estados `Conforme`, `Mejora`, `Acción prioritaria`, `No aplica` y `Pendiente`.
- Registro de observación, medida propuesta, responsable y fecha objetivo.
- Fotografías asociadas a cada punto.
- Guardado local de borradores e historial.
- Apartado global de `Medidas abiertas`, con filtros por área y estado.
- Seguimiento de cada acción: abierta, en curso o cerrada, con responsable, fecha objetivo, fecha de cierre y comentario de verificación.
- Previsualización, descarga en HTML e impresión a PDF del informe.
- Botón para abrir el correo con los destinatarios configurados y opción de compartir el informe como archivo cuando el navegador lo permite:

  - acastillome@iberia.es
  - dcaballero@iberia.es
  - rhgarcia@iberia.es
  - cprudencio@iberia.es
  - jhernandezdo@iberia.es

## Uso local

Abre `index.html` en un navegador moderno. Para que la carga de fotografías funcione de forma consistente, se recomienda usar un servidor local sencillo o publicarla en Cloudflare Pages.

## Publicar en GitHub y Cloudflare Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube al directorio raíz los tres archivos: `index.html`, `styles.css` y `app.js`.
3. En Cloudflare Pages, conecta el repositorio.
4. Configura:
   - Framework preset: `None`.
   - Build command: vacío.
   - Output directory: `/` o el directorio raíz del proyecto.
5. Guarda y despliega.

La aplicación no necesita Node, base de datos ni variables de entorno.

## Almacenamiento y correo

Los datos del historial se guardan en `localStorage` y las imágenes en `IndexedDB`, ambos dentro del navegador del dispositivo que realiza la inspección. Si se cambia de dispositivo o se borra la información del navegador, el historial local no se sincroniza.

El botón `Abrir correo` descarga primero el informe y después abre la aplicación de correo predeterminada con los cinco destinatarios y un resumen ya preparado. El archivo descargado debe adjuntarse manualmente al correo. El botón `Compartir archivo` intenta entregar el informe como adjunto mediante la función de compartir del dispositivo, disponible sobre todo en móviles/tabletas y navegadores compatibles. Esto permite mantener la aplicación como sitio estático sin servidor ni credenciales de correo.

Para adjuntar el informe automáticamente en un correo sin intervención del usuario sería necesario conectar un servicio de correo autenticado, como Microsoft 365 mediante un Worker o Power Automate.

## Personalizar la guía

Las guías están en el array `CHECKLISTS` de `app.js`. Cada punto tiene esta estructura:

```js
["CODIGO", "Título del punto", "Qué se debe observar", "Pista para la medida"]
```

Puedes cambiar, añadir o eliminar puntos sin tocar el resto de la aplicación. La siguiente iteración puede adaptar estas preguntas a los estándares, checklists o procedimientos concretos de cada área.
