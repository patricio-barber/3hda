# Tres historias de una carta de amor fallida

Sitio estático y gratuito, compatible con GitHub Pages. Incluye una portada, tres secciones desplazables con cuenta regresiva y el texto de cada historia, que se muestra en cuanto se cumple la fecha de publicación.

## Vista previa en tu computadora

Inicia un servidor local desde esta carpeta (necesario porque el sitio carga los textos con `fetch`):

```bash
python3 -m http.server 8000
```

Después visita `http://localhost:8000`.

## Qué debes modificar

### Título, fechas e imágenes

Edita **`config.js`**. Cada historia tiene estos campos:

- `title`: título visible.
- `subtitle`: frase breve bajo el título.
- `releaseDate`: fecha y hora de publicación.
- `image`: ruta de su imagen.
- `imageAlt`: descripción accesible de la foto.
- `contentFile`: archivo HTML con el texto de la historia.

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

### El texto de las historias

Edita directamente los archivos dentro de **`content/`** (`historia-uno.html`, `historia-dos.html`, `historia-tres.html`). Escribe un párrafo `<p>` por línea, por ejemplo:

```html
<p>Primer párrafo de la historia.</p>
<p>Segundo párrafo.</p>
```

El texto queda visible en el código fuente del sitio; no hay cifrado ni contraseña. Solo el temporizador controla cuándo aparece el botón para leer cada historia.

## Publicar gratis en GitHub Pages

1. Crea una cuenta en [GitHub](https://github.com/) si aún no tienes una.
2. Crea un repositorio nuevo, por ejemplo `tres-historias`, y elige visibilidad **Public**.
3. Usa **Add file → Upload files** y sube todo el contenido de esta carpeta, conservando las carpetas `assets` y `content`.
4. Abre **Settings → Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama **main**, la carpeta **/(root)** y pulsa **Save**.
7. Después de unos minutos, GitHub mostrará la dirección pública, normalmente `https://TU-USUARIO.github.io/tres-historias/`.

Cada vez que reemplaces archivos en el repositorio, GitHub Pages volverá a publicar el sitio automáticamente.

## Cómo funciona el temporizador

La fecha en `config.js` controla cuándo aparece el botón "Leer la historia". Un visitante técnico todavía podría inspeccionar el código o cambiar el reloj de su propio navegador, pero como el texto no está cifrado, cualquiera con acceso a los archivos del sitio puede leerlo desde el principio; el temporizador es solo una presentación, no una protección real.

