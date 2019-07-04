/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

// Esri
import Accessor = require("esri/core/Accessor");
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
  floorMapping?: (originalFloor: number) => number;
}

@subclass("support/BuildingVisualisation")
class BuildingVisualisation extends declared(Accessor) {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------
  @property()
  layer: BuildingSceneLayer;

  private initialRenderer: HashMap<Renderer> = {};
  private initialDefExp: HashMap<string> = {};
  private initialVisibility: HashMap<boolean> = {};

  @property({
    readOnly: true,
    dependsOn: [
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get layerRenderer() {
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
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get layerOpacity() {
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
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get layerDefinitionExpression() {
    if (this.appState.pageLocation === "floors") {
      return definitionExpressions.floor(this.floorMapping(this.appState.floorNumber));
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

    this.layer = args.layer;

    if (args.floorMapping) {
      this.floorMapping = args.floorMapping;
    }

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

    watchUtils.init(this, "layerRenderer", this._updateBaseRenderer);
    watchUtils.init(this, "customBaseRenderer", this._updateBaseRenderer);

    watchUtils.init(this, "layerDefinitionExpression", (layerDefinitionExpression) => {
      if (!this.appState.pageLocation || this.appState.pageLocation !== "floors") {
        buildingSceneLayerUtils.goThroughSubLayers(this.layer, (sublayer) => {
          if (sublayer.type === "building-component") {
            sublayer.definitionExpression = this.initialDefExp[sublayer.title];
          }
        });
      }
      else {
        buildingSceneLayerUtils.goThroughSubLayers(this.layer, (sublayer) => {
          if (sublayer.type === "building-component") {
            sublayer.definitionExpression = layerDefinitionExpression;
          }
        });
      }
    });

  }

  normalizeCtorArgs(args: BuildingVisualisationCtorArgs) {
    return {
      appState: args.appState
    };
  }


  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _updateBaseRenderer() {
    if (this.customBaseRenderer) {
      buildingSceneLayerUtils.updateSubLayers(this.layer, ["renderer"], this.customBaseRenderer);  
    }
    else if (!this.appState.pageLocation || this.appState.pageLocation === "home") {
      buildingSceneLayerUtils.goThroughSubLayers(this.layer, (sublayer) => {
        if (sublayer.type === "building-component") {
          sublayer.renderer = this.initialRenderer[sublayer.title] && (this.initialRenderer[sublayer.title] as any).clone();
        }
      });
    }
    else {
      buildingSceneLayerUtils.updateSubLayers(this.layer, ["renderer"], this.layerRenderer);
    }
  }

  private floorMapping(originalFloor: number) {
    return originalFloor;
  }

}

export = BuildingVisualisation;
