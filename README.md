# Tres historias de una carta de amor fallida

Sitio estático, gratuito y compatible con GitHub Pages. Incluye una portada, tres secciones desplazables, cuentas regresivas y contenido cifrado que solo puede abrirse con una llave secreta.

## Vista previa en tu computadora

La lectura cifrada necesita que el sitio se sirva por HTTP. Inicia un servidor local desde esta carpeta:

```bash
python3 -m http.server 8000
```

Después visita `http://localhost:8000`.

## Qué debes modificar

### Título, fechas, imágenes y contacto

Edita **`config.js`**. Cada historia tiene estos campos:

- `title`: título visible.
- `subtitle`: frase breve bajo el título.
- `releaseDate`: fecha y hora de publicación.
- `image`: ruta de su imagen.
- `imageAlt`: descripción accesible de la foto.
- `encryptedContent`: archivo cifrado correspondiente a la historia.

También cambia `requestKeyUrl`. Puede ser tu correo:

```js
requestKeyUrl: "mailto:tu-correo@ejemplo.com"
```

Cuando una historia se desbloquee, el botón **Pedir la llave** abrirá ese medio de contacto.

La fecha usa este formato:

```js
releaseDate: "2026-09-15T20:00:00-04:00"
```

Eso significa 15 de septiembre de 2026 a las 8:00 p. m., con desfase UTC−04:00. Incluye siempre el desfase para que la apertura ocurra al mismo instante para visitantes de distintas zonas horarias.

### Tus fotografías

1. Guarda las fotos dentro de **`assets/images/`**.
2. Puedes borrar los cuatro SVG de muestra cuando ya no los uses.
3. Cambia las rutas en `config.js`. Por ejemplo:

```js
heroImage: "assets/images/portada.jpg"

// Dentro de una historia:
image: "assets/images/historia-uno.jpg"
```

Usa JPG o WebP para fotografías. Como referencia, una portada de unos 2000 px de ancho y fotos verticales de unos 1200 × 1500 px se verán bien sin ser innecesariamente pesadas. Evita espacios, acentos y mayúsculas en los nombres de archivo.

### Cifrar el texto de las historias

No escribas el texto ni la llave directamente en los archivos públicos del sitio.

1. Abre `tools/encrypt.html` en un navegador moderno.
2. Elige el nombre correspondiente: `historia-uno`, `historia-dos` o `historia-tres`.
3. Pulsa **Generar llave segura** y copia la llave a un lugar privado, fuera de esta carpeta.
4. Pega la historia. Una línea vacía separa cada párrafo.
5. Pulsa **Cifrar y descargar**.
6. Coloca el JSON descargado dentro de `content/`, reemplazando el archivo del mismo nombre.
7. Prueba la llave antes de publicar.

Usa una llave distinta para cada historia. Nunca subas las llaves a GitHub ni las escribas en `config.js`, README, comentarios o nombres de archivo. Si pierdes una llave, el contenido no se puede recuperar del archivo cifrado.

Las llaves de demostración actuales son:

- Historia I: `demo-lirio-cobre-uno-2026`
- Historia II: `demo-marea-ambar-dos-2026`
- Historia III: `demo-carta-niebla-tres-2026`

Solo abren los textos de muestra. Reemplaza los tres JSON y usa llaves nuevas antes de publicar tus historias reales.

## Publicar gratis en GitHub Pages

1. Crea una cuenta en [GitHub](https://github.com/) si aún no tienes una.
2. Crea un repositorio nuevo, por ejemplo `tres-historias`, y elige visibilidad **Public**.
3. Usa **Add file → Upload files** y sube todo el contenido de esta carpeta, conservando las carpetas `assets`, `content` y `tools`.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama **main**, la carpeta **/(root)** y pulsa **Save**.
7. Después de unos minutos, GitHub mostrará la dirección pública, normalmente `https://TU-USUARIO.github.io/tres-historias/`.

Cada vez que reemplaces archivos en el repositorio, GitHub Pages volverá a publicar el sitio automáticamente.

## Cómo funciona la protección

La fecha controla cuándo aparece el formulario, pero un visitante técnico todavía podría cambiar el reloj o modificar el código para mostrarlo antes. Eso no revela la historia: el contenido está cifrado con AES-GCM y la llave no forma parte del sitio.

Al introducir la llave correcta, la historia se descifra únicamente en la memoria del navegador. La llave no se guarda y se tendrá que escribir nuevamente después de recargar la página.

Una persona autorizada todavía puede copiar el texto o compartir su llave; ningún sitio puede impedir por completo que un lector legítimo comparta lo que ve.
