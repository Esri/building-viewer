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
import Accessor from "esri/core/Accessor";

// App
import AppState from "../AppState";
import * as buildingSceneLayerUtils from "./buildingSceneLayerUtils";
import * as watchUtils from "esri/core/watchUtils";
import Renderer from "esri/renderers/Renderer";
import SceneLayer from "esri/layers/SceneLayer";

@subclass("support/SurroundingsVisualisation")
class SurroundingsVisualisation extends Accessor {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property({
    readOnly: true,
    dependsOn: [
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

  @property()
  layer: SceneLayer;

  @property({ constructOnly: true})
  appState: AppState;

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------

  constructor(args: {layer: SceneLayer, appState: AppState}) {
    super();

    this.appState = args.appState;
    this.layer = args.layer;

    this.layer.when(() => {
        watchUtils.init(this, "surroundingsRenderer", this._updateBaseRenderer);
        watchUtils.init(this, "customRenderer", this._updateBaseRenderer);

        watchUtils.init(this, "surroundingsOpacity", (surroundingsOpacity) => {
          this.layer.opacity = surroundingsOpacity;
        });
    });
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private _updateBaseRenderer() {
    if (this.customRenderer) {
      this.layer.renderer = this.customRenderer;  
    }
    else {
      this.layer.renderer = this.surroundingsRenderer;
    }
  }
}

export = SurroundingsVisualisation;
