/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

// esri
import Sections = require("./sections/Sections");
import SceneView = require("esri/views/SceneView");
import Widget = require("esri/widgets/Widget");
import promiseUtils = require("esri/core/promiseUtils");
// import Collection = require("esri/core/Collection");
import Camera = require("esri/Camera");

// BSLDemo
import Section = require("./sections/Section");
import BuildingVisualisation = require("./support/BuildingVisualisation");
import SurroundingsVisualisation = require("./support/SurroundingsVisualisation");
import AppState = require("./AppState");
import ToggleSchematic = require("./widgets/ToggleSchematic/ToggleSchematic");
import appUtils = require("./support/appUtils");

type SectionSublcass = Pick<Section, "camera">;

interface BSLDemoCtorArgs {
  sections: Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">[];
  mapContainer: string;
  surroundingsLayer: string;
  buildingLayer: string;
}

@subclass("webSceneViewer.widgets.LayersLoading.LayersLoadingProgressBar")
class BSLDemo extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property({ aliasOf: "appState.view"})
  view: SceneView;

  @property({constructOnly: true})
  private mapContainer: string;

  @renderable()
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
  private buildingLayer: BuildingVisualisation;

  @property({ aliasOf: "appState.surroundingsLayer"})
  private surroundingsLayer: SurroundingsVisualisation;  

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------

  constructor(args: BSLDemoCtorArgs) {
    super(args as any);

    this.buildingLayer = new BuildingVisualisation({
      appState: this.appState,
      layer: args.buildingLayer
    });
    this.surroundingsLayer = new SurroundingsVisualisation(args.surroundingsLayer, this.appState);
    this.sections = new Sections(args.sections, this.appState);

  }

  normalizeCtorArgs(args: BSLDemoCtorArgs, container: string) {
    return {
      mapContainer: args.mapContainer,
      container: container
    };
  }

  render() {
    return (<div>
      <div class="left side-container">{this.sections.paneLeft()}</div>
      <div class="left menu">{this.sections.menu()}</div>
      <div class="right side-container">{this.sections.paneRight()}</div>
    </div>);
  }

  postInitialize() {

    this.own(this.sections.on("go-to", (camera: Camera) => {
      this.view.goTo(camera);
    }))

    this.createView().then((view) => {
      this.sections.activateSection("home");
    });

    new ToggleSchematic({
      appState: this.appState, 
      container: "toggleSchematic"
    });
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------


  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------
  private createView() {
    this.view = appUtils.createView({
      mapContainer: this.mapContainer,
      layers: [
        this.buildingLayer,
        this.surroundingsLayer
      ]
    });

    return this.view.when(() => {
      // this.view.map.layers.removeAll();
      // this.view.map.layers = new Collection([
      //   this.buildingLayer,
      //   this.surroundingsLayer
      // ]);
      // this.view.map.ground.surfaceColor = backgroundColor;
      // this.view.map.basemap = null;
      this.view.environment.lighting.directShadowsEnabled = true;
      this.view.environment.lighting.ambientOcclusionEnabled = false;
      window["view"] = this.view;
      return promiseUtils.resolve(this.view);
    });
  }

}

export = BSLDemo;
