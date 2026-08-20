import type { ArcgisLegend } from "@arcgis/map-components/components/arcgis-legend";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-scene";
import {
  FLOORS,
  FLOOR_ORDER,
  HOURS,
  OVERVIEW_DESCRIPTION,
  type SectionId,
} from "./config.ts";
import {
  SceneController,
  type PictureInfo,
  type SceneInfo,
} from "./sceneController.ts";

const sceneElement = document.querySelector<ArcgisScene>("#building-scene")!;
const legendElement = document.querySelector<ArcgisLegend>("#floor-legend")!;
const appElement = document.querySelector<HTMLElement>("#app")!;
const primaryContent = document.querySelector<HTMLElement>("#primary-content")!;
const contextControls =
  document.querySelector<HTMLElement>("#context-controls")!;
const imagePopup = document.querySelector<HTMLElement>("#image-popup")!;
const popupImage = document.querySelector<HTMLImageElement>("#popup-image")!;
const popupCredit = document.querySelector<HTMLElement>("#popup-credit")!;
const popupDismiss =
  document.querySelector<HTMLButtonElement>("#popup-dismiss")!;
const loadingScreen = document.querySelector<HTMLElement>("#loading-screen")!;

let activeSection: SectionId = "overview";
let selectedFloor = 1;
let activeViewpoint: string | null = null;
let activeAudio: HTMLAudioElement | null = null;
let audioButton: HTMLButtonElement | null = null;
let sceneInfo: SceneInfo;
const surroundingsState = {
  carParks: false,
  transportation: false,
};

const showPicture = ({ imageUrl, title }: PictureInfo): void => {
  popupImage.src = imageUrl;
  popupImage.alt = title;
  popupCredit.textContent = title;
  imagePopup.hidden = false;
  requestAnimationFrame(() => imagePopup.classList.add("is-active"));
  popupDismiss.focus();
};

const controller = new SceneController(
  sceneElement,
  legendElement,
  showPicture,
);

const stopAudio = (): void => {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  activeAudio = null;
  if (audioButton) {
    audioButton.classList.remove("is-playing");
    audioButton.setAttribute("aria-label", "Play floor pronunciation");
  }
};

const titleMarkup = (title: string): string =>
  `<h1 class="display-title">${title}</h1>`;

const renderHours = (): string => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  return HOURS.map(([day, hours], index) => {
    const isToday = index === todayIndex;
    return `<div class="hours-row${isToday ? " is-today" : ""}">
      <strong>${isToday ? "Today" : day}</strong><span>${hours}</span>
    </div>`;
  }).join("");
};

const renderOverview = (sceneTitle: string): void => {
  primaryContent.innerHTML = `${titleMarkup(sceneTitle)}
    <p class="overview-copy">${OVERVIEW_DESCRIPTION}</p>
    <section class="hours" aria-labelledby="hours-heading">
      <h2 id="hours-heading" class="slash-title">Opening hours</h2>${renderHours()}
    </section>`;

  contextControls.innerHTML = `<section class="viewpoints" aria-labelledby="viewpoint-heading">
    <h2 id="viewpoint-heading" class="slash-title">Point of view</h2>
    <div class="control-list">
      ${sceneInfo.overviewViewpoints
        .map(
          (title) =>
            `<button type="button" class="viewpoint${activeViewpoint === title ? " is-active" : ""}" data-viewpoint="${title}">${title}</button>`,
        )
        .join("")}
    </div>
  </section>`;

  contextControls
    .querySelectorAll<HTMLButtonElement>("[data-viewpoint]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        activeViewpoint = button.dataset.viewpoint ?? null;
        contextControls
          .querySelectorAll(".viewpoint")
          .forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        if (activeViewpoint) await controller.goToSlide(activeViewpoint);
      });
    });
};

const renderFloor = (): void => {
  const floor = FLOORS[selectedFloor];
  const label = selectedFloor === 0 ? "G" : String(selectedFloor);
  primaryContent.innerHTML = `<section class="floor-content">
    <div class="floor-identity"><span class="floor-word">floor</span><span class="floor-number">${label}</span></div>
    <div class="floor-heading"><h1 class="display-title">${floor.title}</h1><p class="floor-subtitle">[${floor.subtitle}]</p></div>
    <p class="floor-copy">${floor.description}</p>
    <p class="audio-row">Listen to the name of this floor
      <button class="audio-button" type="button" aria-label="Play floor pronunciation"><span></span></button>
    </p>
  </section>`;

  contextControls.innerHTML = `<section class="floor-selector" aria-labelledby="floor-selector-heading">
    <h2 id="floor-selector-heading" class="slash-title">Select floor</h2>
    <div class="floor-list">
      ${FLOOR_ORDER.map(
        (floorNumber) =>
          `<button type="button" data-floor="${floorNumber}" class="floor-option${floorNumber === selectedFloor ? " is-active" : ""}">${floorNumber === 0 ? "G" : floorNumber}</button>`,
      ).join("")}
    </div>
  </section>`;

  audioButton = document.querySelector<HTMLButtonElement>(".audio-button")!;
  const createFloorAudio = (): HTMLAudioElement => {
    const audio = new Audio(floor.audioUrl);
    audio.addEventListener("ended", stopAudio, { once: true });
    return audio;
  };
  activeAudio = createFloorAudio();
  audioButton.addEventListener("click", async () => {
    if (!audioButton) return;
    if (!activeAudio) activeAudio = createFloorAudio();
    if (activeAudio.paused) {
      try {
        await activeAudio.play();
      } catch {
        stopAudio();
        return;
      }
      audioButton.classList.add("is-playing");
      audioButton.setAttribute("aria-label", "Pause floor pronunciation");
    } else {
      activeAudio.pause();
      audioButton.classList.remove("is-playing");
      audioButton.setAttribute("aria-label", "Play floor pronunciation");
    }
  });

  contextControls
    .querySelectorAll<HTMLButtonElement>("[data-floor]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        stopAudio();
        selectedFloor = Number(button.dataset.floor);
        controller.selectFloor(
          selectedFloor,
          FLOORS[selectedFloor].buildingLevel,
        );
        renderFloor();
      });
    });
};

const toggleMarkup = (
  key: keyof typeof surroundingsState,
  label: string,
): string => {
  const active = surroundingsState[key];
  return `<button type="button" class="toggle-row${active ? " is-active" : ""}" data-toggle="${key}" role="switch" aria-checked="${active}">
    <span class="switch" aria-hidden="true"><span></span></span><span>${label}</span>
  </button>`;
};

const renderSurroundings = (): void => {
  primaryContent.innerHTML = `${titleMarkup("Surroundings")}
    <div class="surroundings-controls">
      ${toggleMarkup("carParks", "Car Parks")}
      ${toggleMarkup("transportation", "Transportation")}
      <h2 class="toggle-row is-active poi-heading">Points of Interest</h2>
      <div class="poi-list">
        ${sceneInfo.pointsOfInterest
          .map(
            ({ label, sourceTitle }) =>
              `<button type="button" data-poi="${sourceTitle}"><span class="search-icon" aria-hidden="true"></span>${label}</button>`,
          )
          .join("")}
      </div>
    </div>`;
  contextControls.innerHTML = "";

  primaryContent
    .querySelectorAll<HTMLButtonElement>("[data-toggle]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const key = button.dataset.toggle as keyof typeof surroundingsState;
        surroundingsState[key] = !surroundingsState[key];
        if (key === "carParks" || key === "transportation") {
          await controller.setSurroundingLayer(key, surroundingsState[key]);
        }
        renderSurroundings();
      });
    });

  primaryContent
    .querySelectorAll<HTMLButtonElement>("[data-poi]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        if (button.dataset.poi) await controller.goToSlide(button.dataset.poi);
      });
    });
};

const renderSection = (sceneTitle: string): void => {
  primaryContent.classList.remove("is-entering");
  contextControls.classList.remove("is-entering");
  if (activeSection === "overview") renderOverview(sceneTitle);
  if (activeSection === "floors") renderFloor();
  if (activeSection === "surroundings") renderSurroundings();
  requestAnimationFrame(() => {
    primaryContent.classList.add("is-entering");
    contextControls.classList.add("is-entering");
  });
};

const activateSection = async (
  section: SectionId,
  sceneTitle: string,
): Promise<void> => {
  if (
    section === activeSection &&
    appElement.getAttribute("aria-busy") === "false"
  )
    return;
  stopAudio();
  activeSection = section;
  activeViewpoint = null;
  if (section === "floors") selectedFloor = 1;
  if (section === "surroundings") {
    surroundingsState.carParks = false;
    surroundingsState.transportation = false;
  }
  document
    .querySelectorAll<HTMLButtonElement>("[data-section]")
    .forEach((button) => {
      button.classList.toggle("is-active", button.dataset.section === section);
    });
  renderSection(sceneTitle);
  await controller.activateSection(section);
  if (section === "floors") controller.selectFloor(1, FLOORS[1].buildingLevel);
};

popupDismiss.addEventListener("click", () => {
  imagePopup.classList.remove("is-active");
  window.setTimeout(() => {
    imagePopup.hidden = true;
    popupImage.removeAttribute("src");
  }, 500);
});

const start = async (): Promise<void> => {
  sceneInfo = await controller.initialize();
  const sceneTitle = sceneInfo.title;
  renderSection(sceneTitle);
  appElement.setAttribute("aria-busy", "false");
  document.documentElement.classList.remove("app-loading");
  loadingScreen.remove();

  document
    .querySelectorAll<HTMLButtonElement>("[data-section]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await activateSection(button.dataset.section as SectionId, sceneTitle);
      });
    });

  document.title = sceneTitle;
};

void start();
