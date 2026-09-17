const config = window.STORY_CONFIG;
const chaptersRoot = document.querySelector("#chapters");
const reader = document.querySelector("#story-reader");
const storyContents = new Map();

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

          <button class="story-link" type="button" data-read-index="${index}">
            Leer la historia <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

async function openStory(chapterIndex) {
  const chapter = config.chapters[chapterIndex];

  let html = storyContents.get(chapterIndex);
  if (!html) {
    const response = await fetch(chapter.contentFile, { cache: "no-store" });
    if (!response.ok) return;
    html = await response.text();
    storyContents.set(chapterIndex, html);
  }

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
