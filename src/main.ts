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

// -------------------- DOM references --------------------

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

// -------------------- Application state --------------------

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

// -------------------- Template utilities --------------------

const requireElement = <T extends Element>(
  parent: ParentNode,
  selector: string,
): T => {
  const element = parent.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
};

const cloneTemplate = (id: string): DocumentFragment => {
  const template = requireElement<HTMLTemplateElement>(document, `#${id}`);
  return template.content.cloneNode(true) as DocumentFragment;
};

const replaceWithTemplate = (
  container: HTMLElement,
  templateId: string,
): void => {
  const content = cloneTemplate(templateId);
  container.replaceChildren(content);
};

// -------------------- Media and scene setup --------------------

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

// -------------------- Section rendering --------------------

const renderHours = (container: HTMLElement): void => {
  const todayIndex = (new Date().getDay() + 6) % 7;
  HOURS.forEach(([day, hours], index) => {
    const row = cloneTemplate("hours-row-template");
    const isToday = index === todayIndex;
    requireElement(row, ".hours-row").classList.toggle("is-today", isToday);
    requireElement(row, '[data-field="day"]').textContent = isToday
      ? "Today"
      : day;
    requireElement(row, '[data-field="hours"]').textContent = hours;
    container.append(row);
  });
};

const renderOverview = (sceneTitle: string): void => {
  replaceWithTemplate(primaryContent, "overview-template");
  requireElement(primaryContent, '[data-field="title"]').textContent =
    sceneTitle;
  requireElement(primaryContent, '[data-field="description"]').textContent =
    OVERVIEW_DESCRIPTION;
  renderHours(requireElement(primaryContent, '[data-list="hours"]'));

  replaceWithTemplate(contextControls, "viewpoints-template");
  const viewpoints = requireElement<HTMLElement>(
    contextControls,
    '[data-list="viewpoints"]',
  );
  sceneInfo.overviewViewpoints.forEach((title) => {
    const item = cloneTemplate("viewpoint-button-template");
    const button = requireElement<HTMLButtonElement>(item, "[data-viewpoint]");
    button.dataset.viewpoint = title;
    button.textContent = title;
    button.classList.toggle("is-active", activeViewpoint === title);
    viewpoints.append(item);
  });

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
  replaceWithTemplate(primaryContent, "floor-template");
  requireElement(primaryContent, '[data-field="floor-number"]').textContent =
    label;
  requireElement(primaryContent, '[data-field="title"]').textContent =
    floor.title;
  requireElement(primaryContent, '[data-field="subtitle"]').textContent =
    `[${floor.subtitle}]`;
  requireElement(primaryContent, '[data-field="description"]').textContent =
    floor.description;

  replaceWithTemplate(contextControls, "floor-selector-template");
  const floorList = requireElement<HTMLElement>(
    contextControls,
    '[data-list="floors"]',
  );
  FLOOR_ORDER.forEach((floorNumber) => {
    const item = cloneTemplate("floor-button-template");
    const button = requireElement<HTMLButtonElement>(item, "[data-floor]");
    button.dataset.floor = String(floorNumber);
    button.textContent = floorNumber === 0 ? "G" : String(floorNumber);
    button.classList.toggle("is-active", floorNumber === selectedFloor);
    floorList.append(item);
  });

  audioButton = requireElement<HTMLButtonElement>(
    primaryContent,
    ".audio-button",
  );
  const createFloorAudio = (): HTMLAudioElement => {
    const audio = new Audio(floor.audioUrl);
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audioButton?.classList.remove("is-playing");
      audioButton?.setAttribute("aria-label", "Play floor pronunciation");
    });
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

const renderSurroundings = (): void => {
  replaceWithTemplate(primaryContent, "surroundings-template");
  primaryContent
    .querySelectorAll<HTMLButtonElement>("[data-toggle]")
    .forEach((button) => {
      const key = button.dataset.toggle as keyof typeof surroundingsState;
      const active = surroundingsState[key];
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", String(active));
    });
  const pointsOfInterest = requireElement<HTMLElement>(
    primaryContent,
    '[data-list="points-of-interest"]',
  );
  sceneInfo.pointsOfInterest.forEach(({ label, sourceTitle }) => {
    const item = cloneTemplate("poi-button-template");
    const button = requireElement<HTMLButtonElement>(item, "[data-poi]");
    button.dataset.poi = sourceTitle;
    requireElement(button, '[data-field="label"]').textContent = label;
    pointsOfInterest.append(item);
  });
  contextControls.replaceChildren();

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

// -------------------- Section navigation --------------------

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

// -------------------- Dialog and application startup --------------------

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
