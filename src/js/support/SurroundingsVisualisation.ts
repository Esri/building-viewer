/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import SceneLayer = require("esri/layers/SceneLayer");

// App
import AppState = require("../AppState");
import buildingSceneLayerUtils = require("./buildingSceneLayerUtils");
import watchUtils = require("esri/core/watchUtils");
import Renderer = require("esri/renderers/Renderer");

@subclass("support/SurroundingsVisualisation")
class SurroundingsVisualisation extends declared(SceneLayer) {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get surroundingsRenderer() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "surroundings",
        "renderer"
      );
  }

  @property()
  customRenderer: Renderer;

  @property({
    readOnly: true,
    dependsOn: [
      "appState.mode",
      "appState.pageLocation",
      "appState.floorNumber"
    ]
  })
  get surroundingsOpacity() {
    return buildingSceneLayerUtils
      .getVisualVarsFromAppState(
        this.appState,
        "surroundings",
        "opacity"
      );
  }

  @property({ constructOnly: true})
  appState: AppState;

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------
  constructor(url: string, appState: AppState) {
    super({
      url: url,
      // portalItem: {
      //   id: url,
      //   portal: { url: "https://zrh.mapsdevext.arcgis.com" }
      // },
      // renderer: buildingSceneLayerUtils.getVisualVarsFromAppState(appState, "surroundings", "renderer"),
      // opacity: buildingSceneLayerUtils.getVisualVarsFromAppState(appState, "surroundings", "opacity")
    });

    this.appState = appState;

    watchUtils.whenOnce(this.appState, "view", (view) => {
      // view.whenLayerView(this)
      // .then(() => {
        watchUtils.init(this, "surroundingsRenderer", this._updateBaseRenderer);
        watchUtils.init(this, "customRenderer", this._updateBaseRenderer);

        watchUtils.init(this, "surroundingsOpacity", (surroundingsOpacity) => {
          this.opacity = surroundingsOpacity;
        });
      // })
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


  private _updateBaseRenderer() {
    if (this.customRenderer) {
      this.renderer = this.customRenderer;  
    }
    else {
      this.renderer = this.surroundingsRenderer;
    }
  }
}

export = SurroundingsVisualisation;
