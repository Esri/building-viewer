/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

// esri
import Sections = require("./sections/Sections");
import SceneView = require("esri/views/SceneView");
import Widget = require("esri/widgets/Widget");
import promiseUtils = require("esri/core/promiseUtils");
import Collection = require("esri/core/Collection");
import Camera = require("esri/Camera");
import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import SceneLayer = require("esri/layers/SceneLayer");
import WebScene = require("esri/WebScene");
import Layer = require("esri/layers/Layer");
import GroupLayer = require("esri/layers/GroupLayer");

// BSLDemo
import Section = require("./sections/Section");
import BuildingVisualisation = require("./support/BuildingVisualisation");
import SurroundingsVisualisation = require("./support/SurroundingsVisualisation");
import AppState = require("./AppState");
// import ToggleSchematic = require("./widgets/ToggleSchematic/ToggleSchematic");
import appUtils = require("./support/appUtils");
// import { backgroundColor } from "./support/visualVariables";
import Popup = require("./widgets/Popup/Popup");

type SectionSublcass = Pick<Section, "camera">;

interface BSLDemoCtorArgs {
  sections: Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">[];
  mapContainer: string;
  websceneId: string;
  buildingLayerTitle: string;
  surroundingsLayerTitle: string;
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

  @property({ aliasOf: "appState.initialLayers"})
  initialLayers: Collection<Layer>;

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

    this.view = appUtils.createViewFromWebScene({websceneId: args.websceneId, mapContainer: args.mapContainer});

    (this.view.map as WebScene).when(() => {
      // Save the initial layers:
      promiseUtils.eachAlways(this.view.map.layers.map((l) => this.appState.view.whenLayerView(l))).then((results: any) => {
        results.forEach((result: {value: {layer: Layer}}) => this.recursivelySaveLayer(result.value.layer));

        // Find
        const BSL = appUtils.findLayer(this.initialLayers, args.buildingLayerTitle);

        this.buildingLayer = new BuildingVisualisation({
          appState: this.appState,
          layer: BSL as BuildingSceneLayer
        });

        const surroundingsLayer = appUtils.findLayer(this.view.map.allLayers, args.surroundingsLayerTitle) as SceneLayer;
        this.surroundingsLayer = new SurroundingsVisualisation({layer: surroundingsLayer, appState: this.appState});

        this.view.map.layers.removeAll();

        this.view.map.layers = new Collection([
          this.buildingLayer,
          this.surroundingsLayer.layer
        ]);
      });
    });

    this.view.when(() => {
      this.view.environment.lighting.directShadowsEnabled = true;
      this.view.environment.lighting.ambientOcclusionEnabled = true;
      (this.view.environment.background as any) = {
        type: "color",
        color: [0,0,0,0] as any
      };
      this.view.map.ground.surfaceColor =  [0,0,0,0] as any;
      this.view.padding.left = 300;

      this.view.popup.defaultPopupTemplateEnabled = true;
      this.appState.view.popup.autoOpenEnabled = false;
      this.view.popup.dockOptions = { buttonEnabled:false };
      // this.view.popup.dockEnabled = false;
      
      window["view"] = this.view;
      window["appState"] = this.appState;
      this.sections.activateSection("home");
    });

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
    }));

    new Popup({ appState: this.appState, container: "popup"});

    // new ToggleSchematic({
    //   appState: this.appState, 
    //   container: "toggleSchematic"
    // });
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

  recursivelySaveLayer(layer: Layer | GroupLayer) {
    if (layer instanceof GroupLayer) {
      layer.layers.forEach(l => this.recursivelySaveLayer(l));
    }
    else {
      this.initialLayers.add(layer);
      console.log(layer.title);
      // this.view.map.allLayers.remove(l);
    }
  }
}

export = BSLDemo;
