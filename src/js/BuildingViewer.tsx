/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

// esri
import Sections = require("./sections/Sections");
import SceneView = require("esri/views/SceneView");
import Widget = require("esri/widgets/Widget");
import promiseUtils = require("esri/core/promiseUtils");
import Camera = require("esri/Camera");
import SceneLayer = require("esri/layers/SceneLayer");
import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import WebScene = require("esri/WebScene");

// BuildingViewer
import Section = require("./sections/Section");
import BuildingVisualisation = require("./support/BuildingVisualisation");
import SurroundingsVisualisation = require("./support/SurroundingsVisualisation");
import AppState = require("./AppState");
import appUtils = require("./support/appUtils");
import Popup = require("./widgets/Popup/Popup");

type SectionSublcass = Pick<Section, "camera">;

interface BuildingViewerCtorArgs {
  sections: Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">[];
  mapContainer: string;
  websceneId: string;
  portalUrl?: string;
  floorMapping?: (originalFloor: number) => number;
  extraQuery?: string;
}

@subclass("webSceneViewer.widgets.LayersLoading.LayersLoadingProgressBar")
class BuildingViewer extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property({ aliasOf: "appState.view"})
  view: SceneView;

  @property({ aliasOf: "sections.activeSection"})
  activeSection: SectionSublcass | string | number;

  @property()
  @renderable()
  sections: Sections;

  @property()
  appState = new AppState();

  //--------------------------------------------------------------------------
  //
  //  Variables:
  //
  //--------------------------------------------------------------------------

  @property({ aliasOf: "appState.buildingLayer"})
  buildingLayer: BuildingVisualisation;

  @property({ aliasOf: "appState.surroundingsLayer"})
  surroundingsLayer: SurroundingsVisualisation;

  private firstRendering: boolean = true;  

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------

  constructor(args: BuildingViewerCtorArgs) {
    super(args as any);

    this.view = appUtils.createViewFromWebScene({websceneId: args.websceneId, mapContainer: args.mapContainer, portalUrl: args.portalUrl});
    this.sections = new Sections(args.sections, this.appState);

    (this.view.map as WebScene).when(() => {
      // Save the initial layers:
      promiseUtils
        .eachAlways(this.view.map.layers.map((l) => this.appState.view.whenLayerView(l)))
        .then(() => {

          ///////////////////////////////////
          // Main building to present:
          const BSL = this.appState.view.map.layers.find(layer => layer.title.indexOf(appUtils.MAIN_LAYER_PREFIX) > -1);
          
          if (!BSL) {
            throw new Error("Cannot find the main BuildingSceneLayer (" + appUtils.MAIN_LAYER_PREFIX + ") in the webscene " + args.websceneId);
          }

          const visualisationArgs: any = {
            appState: this.appState,
            layer: BSL as BuildingSceneLayer
          };

          if (args.floorMapping) {
            visualisationArgs.floorMapping = args.floorMapping;
          }

          if (args.extraQuery) {
            visualisationArgs.extraQuery = args.extraQuery;
          }
          
          this.buildingLayer = new BuildingVisualisation(visualisationArgs);

          ///////////////////////////////////
          // Optional surrounding's layer:
          const surroundingsLayer = this.appState.view.map.layers.find(layer => layer.title.toLowerCase().indexOf(appUtils.CITY_LAYER_PREFIX.toLowerCase()) > -1) as SceneLayer;
          if (surroundingsLayer) {
            this.surroundingsLayer = new SurroundingsVisualisation({
              layer: surroundingsLayer,
              appState: this.appState
            });
          }
        });
      
      ///////////////////////////////////
      // Setup camera:
      this.sections.forEach(section => {
        const slide = (this.view.map as WebScene).presentation.slides.find(slide => slide.title.text === section.title);
        if (slide) {
          section.camera = slide.viewpoint.camera;
          (this.view.map as WebScene).presentation.slides.remove(slide);
        }
        else {
          console.error("Could not find a slide for section " + section.title);
        }
      });
    });

    this.view.when(() => {
      // Debug:
      window["view"] = this.view;
      window["appState"] = this.appState;

      // Active first section:
      if (this.sections.length > 0) {
        this.sections.activateSection(this.sections.getItemAt(0).id);
      }
    });

    this.watch("activeSection", (activeSection) => {
      this.firstRendering = true;
      this.renderNow();

      setTimeout(() => {
        this.firstRendering = false;
        this.renderNow();
      }, 10)
    });
  }

  normalizeCtorArgs(args: BuildingViewerCtorArgs, container: string) {
    return {
      mapContainer: args.mapContainer,
      container: container
    };
  }

  render() {
    return (<div>
      <div class="left side-container">{this.sections.paneLeft(this.firstRendering)}</div>
      <div class="left menu">{this.sections.menu()}</div>
      <div class="right side-container">{this.sections.paneRight(this.firstRendering)}</div>
    </div>);
  }

  postInitialize() {

    this.own(this.sections.on("go-to", (camera: Camera) => {
      this.view.goTo(camera);
    }));

    new Popup({ appState: this.appState, container: "popup"});
  }
}

export = BuildingViewer;
