import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import BuildingComponentSublayer = require("esri/layers/buildingSublayers/BuildingComponentSublayer");
import BuildingGroupSublayer = require("esri/layers/buildingSublayers/BuildingGroupSublayer");
import { renderers } from "./visualVariables";
import AppState = require("../AppState");

export function updateSubLayersSymbolLayer (buildingLayer: BuildingSceneLayer, propertyPath: string[], value: any) {
  buildingLayer.when(function() {
    buildingLayer.allSublayers.forEach(function(layer) {
      if (layer instanceof BuildingComponentSublayer && (layer.renderer as any).clone) {
        var renderer = (layer.renderer as any).clone();
        var parentProp = renderer.symbol.symbolLayers.getItemAt(0);
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
      var parentProp = layer;
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
