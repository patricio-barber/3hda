/*
  ESTE ES EL ARCHIVO PRINCIPAL QUE DEBES EDITAR.

  Fechas: usa el formato AAAA-MM-DDTHH:MM:SS-05:00.
  El final (-05:00, por ejemplo) indica la zona horaria de publicación.
  Imágenes: guarda tus fotos en assets/images/ y escribe aquí su ruta.
*/

window.STORY_CONFIG = {
  siteTitle: "Tres historias de una carta de amor fallida",
  kicker: "Una historia en tres tiempos",
  intro:
    "Tres encuentros. Tres despedidas. Una carta que cambia de significado con el paso del tiempo.",
  heroImage: "assets/images/hero-placeholder.svg",

  /*
    Cambia esta dirección por tu correo o por otro enlace de contacto.
    Ejemplos:
    "mailto:tu-correo@ejemplo.com"
    "https://wa.me/15551234567"
  */
  requestKeyUrl: "mailto:patriciobarber@gmail.com",

  chapters: [
    {
      number: "I",
      title: "Historia uno",
      subtitle: "Todo lo que empieza antes de una despedida.",
      releaseDate: "2026-09-15T20:00:00-04:00",
      image: "assets/images/chapter-1-placeholder.svg",
      imageAlt: "Fotografía de la primera historia",
      encryptedContent: "content/historia-uno.json",
    },
    {
      number: "II",
      title: "Historia dos",
      subtitle: "Lo que dijimos cuando ya era demasiado tarde.",
      releaseDate: "2026-10-01T20:00:00-04:00",
      image: "assets/images/chapter-2-placeholder.svg",
      imageAlt: "Fotografía de la segunda historia",
      encryptedContent: "content/historia-dos.json",
    },
    {
      number: "III",
      title: "Historia tres",
      subtitle: "La carta que, al final, nunca llegó.",
      releaseDate: "2026-10-15T20:00:00-04:00",
      image: "assets/images/chapter-3-placeholder.svg",
      imageAlt: "Fotografía de la tercera historia",
      encryptedContent: "content/historia-tres.json",
    },
  ],
};
