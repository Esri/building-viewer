/*
 * Copyright 2019 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { subclass, property } from "esri/core/accessorSupport/decorators";

// Esri
import Accessor from "esri/core/Accessor";
import BuildingSceneLayer from "esri/layers/BuildingSceneLayer";
import * as watchUtils from "esri/core/watchUtils";
import Renderer from "esri/renderers/Renderer";
import { createFilterFor, FLOOR_FILTER_NAME, definitionExpressions } from "./visualVariables";

// App
import AppState from "../AppState";
import * as buildingSceneLayerUtils from "./buildingSceneLayerUtils";

interface BuildingVisualisationCtorArgs {
  layer: BuildingSceneLayer;
  appState: AppState;
  customBaseRenderer?: any;
  floorMapping?: (originalFloor: number) => number;
  extraQuery?: string;
}

@subclass("support/BuildingVisualisation")
class BuildingVisualisation extends Accessor {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------
  @property()
  layer: BuildingSceneLayer;

  private initialRenderer: HashMap<Renderer> = {};

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
  get buildingFilters() {
    if (this.appState.pageLocation === "floors") {
      return createFilterFor(this.floorMapping(this.appState.floorNumber), this.extraQuery);
    }
    return null;
  }

  @property({ constructOnly: true })
  appState: AppState;

  @property()
  extraQuery: string;

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

    if (args.extraQuery) {
      this.extraQuery = args.extraQuery;
    }

    // Save the initial renderers, so that we can set it back:
    buildingSceneLayerUtils.goThroughSubLayers(args.layer, (sublayer) => {
      if (sublayer.type === "building-component") {
        this.initialRenderer[sublayer.title] = (sublayer as any).renderer;
      }
    });

    // To improve performance, we will set a definition expression that will
    // force the api to load the data for floor attribute:
    buildingSceneLayerUtils.goThroughSubLayers(args.layer, (sublayer) => {
      if (sublayer.type === "building-component") {
        sublayer.definitionExpression = definitionExpressions.basic;
      }
    });

    watchUtils.init(this, "layerRenderer", this._updateBaseRenderer);
    watchUtils.init(this, "customBaseRenderer", this._updateBaseRenderer);

    // Set the building filters when necessary:
    watchUtils.init(this, "buildingFilters", (buildingFilters) => {
      if (!this.appState.pageLocation || this.appState.pageLocation !== "floors") {
        this.layer.activeFilterId = null;
      }
      else {
        const currentFilter = this.layer.filters.find((filter: any) => filter.name === FLOOR_FILTER_NAME);
        if (currentFilter) {
          this.layer.filters.remove(currentFilter);
        }
        this.layer.filters.push(buildingFilters);
        this.layer.activeFilterId = this.layer.filters.find((filter: any) => filter.name === FLOOR_FILTER_NAME).id;
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
    else if (!this.appState.pageLocation || this.appState.pageLocation === "home" || this.appState.pageLocation === "custom") {
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
