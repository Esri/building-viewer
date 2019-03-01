/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

// Esri
import Collection = require("esri/core/Collection");
import GroupLayer = require("esri/layers/GroupLayer");
import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import watchUtils = require("esri/core/watchUtils");
import Renderer = require("esri/renderers/Renderer");
import { definitionExpressions } from "./visualVariables";

// App
import AppState = require("../AppState");
import buildingSceneLayerUtils = require("./buildingSceneLayerUtils");

interface BuildingVisualisationCtorArgs {
  layer: BuildingSceneLayer;
  appState: AppState;
  customBaseRenderer?: any;
}

@subclass("support/BuildingVisualisation")
class BuildingVisualisation extends declared(GroupLayer) {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------
  @property()
  private baseLayer: BuildingSceneLayer;

  @property()
  // private secondaryLayer: BuildingSceneLayer;

  private initialRenderer: HashMap<Renderer> = {};
  private initialDefExp: HashMap<string> = {};
  private initialVisibility: HashMap<boolean> = {};

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get baseLayerRenderer() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "mainBuilding",
        "renderer"
      );
  }

  @property()
  customBaseRenderer: Renderer;

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get secondaryLayerRenderer() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "secondaryBuilding",
        "renderer"
      );
  }

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get baseLayerOpacity() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "mainBuilding",
        "opacity"
      );
  }

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get secondaryLayerOpacity() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "secondaryBuilding",
        "opacity"
      );
  }

  @property({
    readOnly: true,
    dependsOn: [
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get baseLayerDefinitionExpression() {
    if (this.appState.pageLocation === "floors") {
      return definitionExpressions.floor(this.floorMapping());
    }
    return definitionExpressions.basic;
  }

  @property({
    readOnly: true,
    dependsOn: [
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get secondaryLayerDefinitionExpression() {
    if (this.appState.pageLocation === "floors") {
      return definitionExpressions.belowFloor(this.floorMapping());
    }
    return definitionExpressions.basic;
  }

  @property({ constructOnly: true})
  appState: AppState;

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------
  constructor(args: BuildingVisualisationCtorArgs) {
    super();

    this.appState = args.appState;

    this.baseLayer = args.layer; 
    // new BuildingSceneLayer({
    //   url: args.layer.url
    // });

    buildingSceneLayerUtils.goThroughSubLayers(args.layer, (sublayer) => {
      if (sublayer.type === "building-component") {
        this.initialRenderer[sublayer.title] = (sublayer as any).renderer;
      }
    });

    buildingSceneLayerUtils.goThroughSubLayers(args.layer, (sublayer) => {
      if (sublayer.type === "building-component") {
        this.initialDefExp[sublayer.title] = sublayer.definitionExpression;
      }
    });
    buildingSceneLayerUtils.goThroughSubLayers(args.layer, (sublayer) => {
      this.initialVisibility[sublayer.title] = sublayer.visible;
    });

    // this.secondaryLayer = args.layer;
    // this.secondaryLayer.opacity = 0;

    // this.secondaryLayer = new BuildingSceneLayer({
    //   url: args.layer,
    //   // portalItem: {
    //   //   id: args.layer,
    //   //   portal: { url: "https://zrh.mapsdevext.arcgis.com" }
    //   // },
    //   opacity: 0
    // });

    this.layers = new Collection([this.baseLayer]);

    watchUtils.init(this, "baseLayerRenderer", this._updateBaseRenderer);
    watchUtils.init(this, "customBaseRenderer", this._updateBaseRenderer);

    // watchUtils.init(this, "appState.mode", (mode) => {
    //   if (mode === "real") {
    //     this.secondaryLayer.opacity = 1;
    //     this.baseLayer.opacity = 0;
    //   }
    //   else {
    //     this.baseLayer.opacity = 1;
    //     this.secondaryLayer.opacity = 0;
    //   }
    // });

    // buildingSceneLayerUtils.updateSubLayers(this.baseLayer, ["visible"], true);
    // buildingSceneLayerUtils.goThroughSubLayers(this.baseLayer, (sublayer) => {
    //   sublayer.opacity = this.initialOpacity[sublayer.title];
    // });


    // watchUtils.init(this, "secondaryLayerRenderer", (baseLayerRenderer) => {
    //   buildingSceneLayerUtils.updateSubLayers(this.secondaryLayer, ["renderer"], baseLayerRenderer);
    // });

    // watchUtils.init(this, "baseLayerOpacity", (baseLayerOpacity) => {
    //   this.baseLayer.opacity = baseLayerOpacity;
    // });

    // watchUtils.init(this, "secondaryLayerOpacity", (secondaryLayerOpacity) => {
    //   this.secondaryLayer.opacity = secondaryLayerOpacity;
    // });

    watchUtils.init(this, "baseLayerDefinitionExpression", (baseLayerDefinitionExpression) => {
      if (!this.appState.pageLocation || this.appState.pageLocation !== "floors") {
        buildingSceneLayerUtils.goThroughSubLayers(this.baseLayer, (sublayer) => {
          if (sublayer.type === "building-component") {
            sublayer.definitionExpression = this.initialDefExp[sublayer.title];
          }
        });
      }
      else {
        buildingSceneLayerUtils.goThroughSubLayers(this.baseLayer, (sublayer) => {
          if (sublayer.type === "building-component") {
            sublayer.definitionExpression = baseLayerDefinitionExpression;
          }
        });
      }
    });

    // watchUtils.init(this, "secondaryLayerDefinitionExpression", (secondaryLayerDefinitionExpression) => {
    //   buildingSceneLayerUtils.updateSubLayers(this.secondaryLayer, ["definitionExpression"], secondaryLayerDefinitionExpression);
    // });
  }

  normalizeCtorArgs(args: BuildingVisualisationCtorArgs) {
    return {
      appState: args.appState
    };
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  updateBaseRenderer(renderer?: Renderer) {
    if (renderer) {
      this.customBaseRenderer = renderer;
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _updateBaseRenderer() {
    if (this.customBaseRenderer) {
      buildingSceneLayerUtils.updateSubLayers(this.baseLayer, ["renderer"], this.customBaseRenderer);  
    }
    else if (!this.appState.pageLocation || this.appState.pageLocation === "home") {
      buildingSceneLayerUtils.goThroughSubLayers(this.baseLayer, (sublayer) => {
        if (sublayer.type === "building-component") {
          sublayer.renderer = this.initialRenderer[sublayer.title] && (this.initialRenderer[sublayer.title] as any).clone();
        }
      });
    }
    else {
      buildingSceneLayerUtils.updateSubLayers(this.baseLayer, ["renderer"], this.baseLayerRenderer);
    }
  }

  private floorMapping() {
    let floor = this.appState.floorNumber + 1;
    if (floor >= 3) {
      floor += 1;
    }

    return floor;
  }

}

export = BuildingVisualisation;
