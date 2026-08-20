import type { ArcgisLegend } from "@arcgis/map-components/components/arcgis-legend";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import type GroupLayer from "@arcgis/core/layers/GroupLayer.js";
import type SceneLayer from "@arcgis/core/layers/SceneLayer.js";
import type BuildingComponentSublayer from "@arcgis/core/layers/buildingSublayers/BuildingComponentSublayer.js";
import type BuildingSceneLayer from "@arcgis/core/layers/BuildingSceneLayer.js";
import BuildingFilter from "@arcgis/core/layers/support/BuildingFilter.js";
import Portal from "@arcgis/core/portal/Portal.js";
import PortalItem from "@arcgis/core/portal/PortalItem.js";
import type Renderer from "@arcgis/core/renderers/Renderer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import SolidEdges3D from "@arcgis/core/symbols/edges/SolidEdges3D.js";
import type SceneView from "@arcgis/core/views/SceneView.js";
import type Slide from "@arcgis/core/webscene/Slide.js";
import type SunLighting from "@arcgis/core/webscene/SunLighting.js";
import WebScene from "@arcgis/core/WebScene.js";
import {
  FLOOR_FILTER_NAME,
  LAYER_TITLES,
  PORTAL_URL,
  SECTION_TITLES,
  WEB_SCENE_ID,
  floorFilterExpression,
  type SectionId,
} from "./config.ts";

export interface PictureInfo {
  imageUrl: string;
  title: string;
}

export interface SceneInfo {
  title: string;
  overviewViewpoints: string[];
  pointsOfInterest: { label: string; sourceTitle: string }[];
}

const POINT_OF_INTEREST_PREFIX = "Points of Interest: ";

const meshRenderer = (
  color: [number, number, number, number],
  colorMixMode: "replace" | "tint",
) =>
  new SimpleRenderer({
    symbol: {
      type: "mesh-3d",
      symbolLayers: [
        {
          type: "fill",
          material: { color, colorMixMode },
          edges: new SolidEdges3D({ color: [30, 30, 30, 1] }),
        },
      ],
    },
  } as ConstructorParameters<typeof SimpleRenderer>[0]);

export class SceneController {
  private readonly originalRenderers = new Map<
    BuildingComponentSublayer,
    Renderer | null
  >();
  private readonly slides = new Map<string, Slide>();
  private view!: SceneView;
  private webScene!: WebScene;
  private buildingLayer!: BuildingSceneLayer;
  private cityLayer!: SceneLayer;
  private floorPoints!: FeatureLayer;
  private floorPictures!: FeatureLayer;
  private carParks!: FeatureLayer;
  private transportation!: GroupLayer;
  private previousLightingDate: Date | null = null;
  private activeSection: SectionId = "overview";

  constructor(
    private readonly sceneElement: ArcgisScene,
    private readonly legendElement: ArcgisLegend,
    private readonly onPicture: (picture: PictureInfo) => void,
  ) {}

  async initialize(): Promise<SceneInfo> {
    const portal = new Portal({ url: PORTAL_URL });
    this.webScene = new WebScene({
      portalItem: new PortalItem({ id: WEB_SCENE_ID, portal }),
    });
    this.sceneElement.map = this.webScene;
    await this.sceneElement.viewOnReady();
    this.view = this.sceneElement.view;
    await this.webScene.loadAll();
    this.sceneElement.padding = { top: 0, right: 0, bottom: 0, left: 300 };
    this.sceneElement.popupDisabled = true;

    for (const slide of this.webScene.presentation.slides)
      this.slides.set(slide.title.text, slide);

    this.buildingLayer = this.requireLayer<BuildingSceneLayer>(
      LAYER_TITLES.building,
    );
    this.cityLayer = this.requireLayer<SceneLayer>(LAYER_TITLES.city);
    this.floorPoints = this.requireLayer<FeatureLayer>(
      LAYER_TITLES.floorPoints,
    );
    this.floorPictures = this.requireLayer<FeatureLayer>(
      LAYER_TITLES.floorPictures,
    );
    this.carParks = this.requireLayer<FeatureLayer>(LAYER_TITLES.carParks);
    this.transportation = this.requireLayer<GroupLayer>(
      LAYER_TITLES.transportation,
    );

    for (const sublayer of this.buildingLayer.allSublayers) {
      if (sublayer.type === "building-component") {
        const component = sublayer as BuildingComponentSublayer;
        this.originalRenderers.set(
          component,
          component.renderer?.clone() ?? null,
        );
      }
    }

    this.floorPoints.visible = false;
    this.floorPictures.visible = false;
    this.floorPictures.legendEnabled = false;
    this.floorPictures.outFields = ["*"];
    this.legendElement.layerInfos = [
      { layer: this.floorPoints, title: "Legend" },
    ];

    this.view.on("click", async (event) => {
      if (this.activeSection !== "floors") return;
      const response = await this.view.hitTest(event);
      const result = response.results.find(
        (candidate) =>
          "graphic" in candidate &&
          candidate.graphic.layer === this.floorPictures,
      );
      if (result && "graphic" in result) {
        this.onPicture({
          imageUrl: String(result.graphic.attributes.url),
          title: String(result.graphic.attributes.title),
        });
      }
    });

    await this.enterOverview(false, false);
    const sectionTitles = new Set<string>(Object.values(SECTION_TITLES));
    const slideTitles = [...this.slides.keys()];
    return {
      title: this.webScene.portalItem?.title ?? "Building Viewer",
      overviewViewpoints: slideTitles.filter(
        (title) =>
          !sectionTitles.has(title) &&
          !title.startsWith(POINT_OF_INTEREST_PREFIX),
      ),
      pointsOfInterest: slideTitles
        .filter((title) => title.startsWith(POINT_OF_INTEREST_PREFIX))
        .map((sourceTitle) => ({
          label: sourceTitle.slice(POINT_OF_INTEREST_PREFIX.length),
          sourceTitle,
        })),
    };
  }

  async activateSection(section: SectionId): Promise<void> {
    this.leaveSection(this.activeSection);
    this.activeSection = section;
    if (section === "overview") await this.enterOverview();
    if (section === "floors") await this.enterFloors();
    if (section === "surroundings") await this.enterSurroundings();
  }

  async goToSlide(title: string, animate = true): Promise<void> {
    const slide = this.slides.get(title);
    const camera = slide?.viewpoint.camera;
    if (camera) await this.sceneElement.goTo(camera, { animate });
  }

  selectFloor(uiFloor: number, buildingLevel: number): void {
    this.floorPoints.definitionExpression = `level_id = ${uiFloor}`;
    this.floorPictures.definitionExpression = `level_id = ${uiFloor}`;
    const previous = this.buildingLayer.filters.find(
      (filter) => filter.name === FLOOR_FILTER_NAME,
    );
    if (previous) this.buildingLayer.filters.remove(previous);

    const filter = new BuildingFilter({
      name: FLOOR_FILTER_NAME,
      filterBlocks: [
        {
          filterExpression: floorFilterExpression(buildingLevel),
          filterMode: { type: "solid" },
          title: "floor",
        },
      ],
    });
    this.buildingLayer.filters.add(filter);
    this.buildingLayer.activeFilterId = filter.id;
  }

  async setSurroundingLayer(
    layer: "carParks" | "transportation",
    visible: boolean,
  ): Promise<void> {
    (layer === "carParks" ? this.carParks : this.transportation).visible =
      visible;
    if (visible) await this.goToSlide(SECTION_TITLES.surroundings);
  }

  private async enterOverview(
    animate = true,
    restoreRenderers = true,
  ): Promise<void> {
    this.cityLayer.opacity = 1;
    this.cityLayer.renderer = meshRenderer([100, 100, 100, 1], "replace");
    this.setDirectShadows(true);
    await this.goToSlide(SECTION_TITLES.overview, animate);
    if (restoreRenderers) this.restoreBuildingRenderers();
  }

  private async enterFloors(): Promise<void> {
    this.previousLightingDate = this.getSunLighting()?.date ?? null;
    this.cityLayer.opacity = 0;
    this.floorPoints.visible = true;
    this.floorPictures.visible = true;
    this.legendElement.hidden = false;
    this.setDirectShadows(false);
    const lighting = this.getSunLighting();
    if (lighting) lighting.date = new Date("2019-08-01T01:00:00.000Z");
    await this.goToSlide(SECTION_TITLES.floors);
  }

  private async enterSurroundings(): Promise<void> {
    this.cityLayer.opacity = 1;
    this.cityLayer.renderer = meshRenderer([255, 255, 255, 1], "tint");
    this.carParks.visible = false;
    this.transportation.visible = false;
    this.setDirectShadows(true);
    await this.goToSlide(SECTION_TITLES.surroundings);
    this.restoreBuildingRenderers();
  }

  private leaveSection(section: SectionId): void {
    if (section === "floors") {
      this.floorPoints.visible = false;
      this.floorPictures.visible = false;
      this.legendElement.hidden = true;
      this.buildingLayer.activeFilterId = null;
      this.setDirectShadows(true);
      const lighting = this.getSunLighting();
      if (lighting && this.previousLightingDate)
        lighting.date = this.previousLightingDate;
    }
    if (section === "surroundings") {
      this.carParks.visible = false;
      this.transportation.visible = false;
    }
  }

  private requireLayer<T>(title: string): T {
    const layer = this.webScene.allLayers.find(
      (candidate) => candidate.title === title,
    );
    if (!layer) throw new Error(`Required WebScene layer not found: ${title}`);
    return layer as T;
  }

  private restoreBuildingRenderers(): void {
    for (const [component, renderer] of this.originalRenderers) {
      if (renderer) component.renderer = renderer;
    }
  }

  private getSunLighting(): SunLighting | null {
    const lighting = this.view.environment.lighting;
    return lighting.type === "sun" ? lighting : null;
  }

  private setDirectShadows(enabled: boolean): void {
    this.view.environment.lighting.directShadowsEnabled = enabled;
  }
}
