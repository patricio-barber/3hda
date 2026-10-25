const config = window.STORY_CONFIG;
const chaptersRoot = document.querySelector("#chapters");
const reader = document.querySelector("#story-reader");
const storyContents = new Map();

const pad = (value) => String(value).padStart(2, "0");

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

function chapterMarkup(chapter, index) {
  return `
    <section class="chapter" id="historia-${index + 1}" style="--chapter-image: url('${chapter.image}')">
      <div class="chapter__panel">
        <h2>${chapter.title}</h2>

        <div class="release ${index === 0 ? "is-unlocked" : ""}" data-release="${chapter.releaseDate}">
          ${index === 0 ? "" : countdownMarkup()}
          <p class="release__announcement" role="status" aria-live="polite"></p>

          <button class="story-link" type="button" data-read-index="${index}">
            ${chapter.storyTitle}
          </button>
        </div>
      </div>
      ${index === 0 ? `
        <section class="sea-reader" hidden aria-label="Lectura de El Mar">
          <header class="sea-reader__header">
            <h3 tabindex="-1">El Mar</h3>
            <button type="button" data-sea-close>Cerrar ×</button>
          </header>
          <div class="sea-reader__text"></div>
          <nav class="sea-reader__nav" aria-label="Páginas de El Mar">
            <button type="button" data-sea-prev>← Anterior</button>
            <span data-sea-status role="status" aria-live="polite"></span>
            <button type="button" data-sea-next>Siguiente →</button>
          </nav>
        </section>` : ""}
    </section>
  `;
}

async function openStory(chapterIndex) {
  const chapter = config.chapters[chapterIndex];

  let html = storyContents.get(chapterIndex);
  if (!html) {
    const response = await fetch(chapter.contentFile, { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar la historia.");
    html = await response.text();
    storyContents.set(chapterIndex, html);
  }

  if (chapterIndex === 0) {
    const overlay = document.querySelector(".sea-reader");
    const content = document.createElement("div");
    content.innerHTML = html;
    seaPages = [...content.querySelectorAll(".story-page")];
    seaPageIndex = 0;
    renderSeaPage();
    overlay.hidden = false;
    document.querySelector("#historia-1 .chapter__panel").hidden = true;
    overlay.querySelector("h3").focus({ preventScroll: true });
    return;
  }

  document.querySelector("#reader-number").textContent = `Historia ${chapter.number}`;
  document.querySelector("#reader-title").textContent = chapter.storyTitle;
  document.querySelector("#reader-body").innerHTML = html;
  reader.showModal();
  reader.scrollTop = 0;
}

let seaPages = [];
let seaPageIndex = 0;

function renderSeaPage() {
  const overlay = document.querySelector(".sea-reader");
  const text = overlay.querySelector(".sea-reader__text");
  text.replaceChildren(seaPages[seaPageIndex].cloneNode(true));
  text.scrollTop = 0;
  overlay.querySelector("[data-sea-status]").textContent = `Página ${seaPageIndex + 1} de ${seaPages.length}`;
  overlay.querySelector("[data-sea-prev]").disabled = seaPageIndex === 0;
  overlay.querySelector("[data-sea-next]").disabled = seaPageIndex === seaPages.length - 1;
}

function closeSeaReader() {
  document.querySelector(".sea-reader").hidden = true;
  document.querySelector("#historia-1 .chapter__panel").hidden = false;
  document.querySelector('[data-read-index="0"]').focus({ preventScroll: true });
}

function unlockChapter(releaseElement) {
  if (releaseElement.dataset.unlocked === "true") return;

  releaseElement.dataset.unlocked = "true";
  releaseElement.classList.add("is-unlocked");
  releaseElement.querySelector(".release__announcement").textContent =
    "El capítulo se ha desbloqueado.";
}

function updateCountdown(releaseElement) {
  const releaseTime = new Date(releaseElement.dataset.release).getTime();
  const remaining = releaseTime - Date.now();

  if (!Number.isFinite(releaseTime)) {
    releaseElement.querySelector(".release__announcement").textContent =
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
  document.querySelector(".hero__image").style.backgroundImage = `url("${config.heroImage}")`;

  chaptersRoot.innerHTML = config.chapters.map(chapterMarkup).join("");

  document.querySelectorAll("[data-read-index]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await openStory(Number(button.dataset.readIndex));
      } catch (error) {
        button.closest(".release").querySelector(".release__announcement").textContent =
          "No se pudo cargar la historia. Inténtalo de nuevo.";
      } finally {
        button.disabled = false;
      }
    });
  });
  document.querySelector("[data-sea-close]").addEventListener("click", closeSeaReader);
  document.querySelector("[data-sea-prev]").addEventListener("click", () => {
    if (seaPageIndex > 0) { seaPageIndex--; renderSeaPage(); }
  });
  document.querySelector("[data-sea-next]").addEventListener("click", () => {
    if (seaPageIndex < seaPages.length - 1) { seaPageIndex++; renderSeaPage(); }
  });
  document.querySelector(".sea-reader").addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSeaReader();
  });
  reader.querySelector(".reader__close").addEventListener("click", () => reader.close());
  reader.addEventListener("click", (event) => {
    if (event.target === reader) reader.close();
  });

  const releases = [...document.querySelectorAll(".release:not(.is-unlocked)")];
  const updateAll = () => releases.forEach(updateCountdown);
  updateAll();
  window.setInterval(updateAll, 1000);
}

initializeSite();
