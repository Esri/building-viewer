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
import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import BuildingComponentSublayer = require("esri/layers/buildingSublayers/BuildingComponentSublayer");
import BuildingGroupSublayer = require("esri/layers/buildingSublayers/BuildingGroupSublayer");
import { renderers } from "./visualVariables";
import AppState = require("../AppState");

export function updateSubLayersSymbolLayer (buildingLayer: BuildingSceneLayer, propertyPath: string[], value: any) {
  buildingLayer.when(function() {
    buildingLayer.allSublayers.forEach(function(layer) {
      if (layer instanceof BuildingComponentSublayer && (layer.renderer as any).clone) {
        const renderer = (layer.renderer as any).clone();
        let parentProp = renderer.symbol.symbolLayers.getItemAt(0);
        propertyPath.forEach(function (prop, i) {
          if (i === (propertyPath.length - 1)) {
            parentProp[prop] = value;
          }
          else {
            parentProp = parentProp[prop];
          }
        });
        layer.renderer = renderer;
      }
    });
  });
}

export function updateSubLayers(buildingLayer: BuildingSceneLayer, propertyPath: string[], value: any) {
  buildingLayer.when(function() {
    buildingLayer.allSublayers.forEach(function(layer) {
      let parentProp = layer;
      propertyPath.forEach(function (prop, i) {
        if (i === (propertyPath.length - 1)) {
          parentProp[prop] = value;
        }
        else {
          parentProp = parentProp[prop];
        }
      });
    });
  });
}

export function goThroughSubLayers(buildingLayer: BuildingSceneLayer, callback: (sublayers: BuildingComponentSublayer | BuildingGroupSublayer) => void) {
  buildingLayer.when(function() {
    buildingLayer.allSublayers.forEach(function(layer) {
      callback(layer);
    });
  });
}

export function getVisualVarsFromAppState(appState: AppState, layerName: string, propertyName: string) {
  const defaultProps = renderers[layerName]["default"][propertyName];
  const customPage = renderers[layerName][appState.pageLocation] ? renderers[layerName][appState.pageLocation][propertyName] : undefined;

  if (customPage !== undefined) {
    return customPage;
  }
  
  return defaultProps;
}
