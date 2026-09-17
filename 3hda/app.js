const config = window.STORY_CONFIG;
const chaptersRoot = document.querySelector("#chapters");
const reader = document.querySelector("#story-reader");
const decryptedStories = new Map();

const pad = (value) => String(value).padStart(2, "0");

function formatReleaseDate(date) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function getTimeParts(milliseconds) {
  const secondsTotal = Math.max(0, Math.floor(milliseconds / 1000));

  return {
    days: Math.floor(secondsTotal / 86400),
    hours: Math.floor((secondsTotal % 86400) / 3600),
    minutes: Math.floor((secondsTotal % 3600) / 60),
    seconds: secondsTotal % 60,
  };
}

function countdownMarkup() {
  return `
    <div class="countdown">
      <div><strong data-unit="days">00</strong><span>días</span></div>
      <i>—</i>
      <div><strong data-unit="hours">00</strong><span>horas</span></div>
      <i>—</i>
      <div><strong data-unit="minutes">00</strong><span>minutos</span></div>
      <i>—</i>
      <div><strong data-unit="seconds">00</strong><span>segundos</span></div>
    </div>
  `;
}

function buildRequestUrl(chapter) {
  const url = config.requestKeyUrl;
  if (!url || !url.startsWith("mailto:")) return url || "#";

  const separator = url.includes("?") ? "&" : "?";
  const subject = encodeURIComponent(`Solicitud de llave: ${chapter.title}`);
  return `${url}${separator}subject=${subject}`;
}

function chapterMarkup(chapter, index) {
  const release = new Date(chapter.releaseDate);

  return `
    <section class="chapter ${index % 2 ? "chapter--reverse" : ""}" id="historia-${index + 1}">
      <figure class="chapter__visual">
        <img src="${chapter.image}" alt="${chapter.imageAlt}" />
        <figcaption>Historia ${chapter.number}</figcaption>
      </figure>

      <div class="chapter__panel">
        <p class="chapter__number">${chapter.number}</p>
        <h2>${chapter.title}</h2>
        <p class="chapter__subtitle">${chapter.subtitle}</p>

        <div class="release" data-release="${chapter.releaseDate}">
          <p class="release__label">Esta historia se abre en</p>
          ${countdownMarkup()}
          <p class="release__date">${formatReleaseDate(release)}</p>
          <p class="release__announcement" role="status" aria-live="polite"></p>

          <div class="key-gate">
            <p class="key-gate__intro">Esta historia está cifrada. Pídeme la llave para abrirla.</p>
            <a class="request-key" href="${buildRequestUrl(chapter)}">Pedir la llave</a>
            <form class="key-form" data-chapter-index="${index}">
              <label for="key-${index}">Llave de acceso</label>
              <div class="key-form__row">
                <input
                  id="key-${index}"
                  name="key"
                  type="password"
                  autocomplete="off"
                  autocapitalize="none"
                  spellcheck="false"
                  required
                />
                <button type="submit">Abrir</button>
              </div>
              <p class="key-form__status" role="status" aria-live="polite"></p>
            </form>
          </div>

          <button class="story-link" type="button" data-read-index="${index}">
            Leer la historia <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function base64ToBytes(value) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function decryptContent(payload, password) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(payload.salt),
      iterations: payload.iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}

async function handleKeySubmission(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const chapterIndex = Number(form.dataset.chapterIndex);
  const chapter = config.chapters[chapterIndex];
  const release = form.closest(".release");
  const input = form.elements.key;
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".key-form__status");

  button.disabled = true;
  input.disabled = true;
  status.classList.remove("is-error");
  status.textContent = "Comprobando la llave…";

  try {
    const response = await fetch(chapter.encryptedContent, { cache: "no-store" });
    if (!response.ok) throw new Error("content-unavailable");

    const payload = await response.json();
    const html = await decryptContent(payload, input.value);
    decryptedStories.set(chapterIndex, html);
    input.value = "";
    release.classList.add("is-decrypted");
    status.textContent = "Llave correcta. La historia está abierta.";
    release.querySelector(".story-link").focus();
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = error.message === "content-unavailable"
      ? "No se pudo cargar la historia. Inténtalo de nuevo."
      : "Esa llave no es correcta.";
  } finally {
    button.disabled = false;
    input.disabled = false;
    if (!release.classList.contains("is-decrypted")) input.focus();
  }
}

function openStory(chapterIndex) {
  const chapter = config.chapters[chapterIndex];
  const html = decryptedStories.get(chapterIndex);
  if (!html) return;

  document.querySelector("#reader-number").textContent = `Historia ${chapter.number}`;
  document.querySelector("#reader-title").textContent = chapter.title;
  document.querySelector("#reader-body").innerHTML = html;
  reader.showModal();
  reader.scrollTop = 0;
}

function unlockChapter(releaseElement) {
  if (releaseElement.dataset.unlocked === "true") return;

  releaseElement.dataset.unlocked = "true";
  releaseElement.classList.add("is-unlocked");
  releaseElement.querySelector(".release__label").textContent = "La historia ya está disponible";
  releaseElement.querySelector(".release__announcement").textContent =
    "El capítulo se ha desbloqueado.";
}

function updateCountdown(releaseElement) {
  const releaseTime = new Date(releaseElement.dataset.release).getTime();
  const remaining = releaseTime - Date.now();

  if (!Number.isFinite(releaseTime)) {
    releaseElement.querySelector(".release__label").textContent =
      "Revisa la fecha de publicación en config.js";
    return;
  }

  if (remaining <= 0) {
    unlockChapter(releaseElement);
    return;
  }

  const parts = getTimeParts(remaining);
  Object.entries(parts).forEach(([unit, value]) => {
    releaseElement.querySelector(`[data-unit="${unit}"]`).textContent = pad(value);
  });

}

function initializeSite() {
  document.title = config.siteTitle;
  document.querySelector("#site-title").textContent = config.siteTitle;
  document.querySelector("#site-kicker").textContent = config.kicker;
  document.querySelector("#site-intro").textContent = config.intro;
  document.querySelector("#footer-title").textContent = config.siteTitle;
  document.querySelector(".hero__image").style.backgroundImage = `url("${config.heroImage}")`;

  chaptersRoot.innerHTML = config.chapters.map(chapterMarkup).join("");

  document.querySelectorAll(".key-form").forEach((form) => {
    form.addEventListener("submit", handleKeySubmission);
  });
  document.querySelectorAll("[data-read-index]").forEach((button) => {
    button.addEventListener("click", () => openStory(Number(button.dataset.readIndex)));
  });
  reader.querySelector(".reader__close").addEventListener("click", () => reader.close());
  reader.addEventListener("click", (event) => {
    if (event.target === reader) reader.close();
  });

  const releases = [...document.querySelectorAll(".release")];
  const updateAll = () => releases.forEach(updateCountdown);
  updateAll();
  window.setInterval(updateAll, 1000);
}

initializeSite();
