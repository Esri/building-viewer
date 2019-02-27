import BuildingSceneLayer = require("esri/layers/BuildingSceneLayer");
import BuildingComponentSublayer = require("esri/layers/buildingSublayers/BuildingComponentSublayer");
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

export function getVisualVarsFromAppState(appState: AppState, layerName: string, propertyName: string) {
  const defaultProps = renderers[layerName]["default"][propertyName];
  const customMode = renderers[layerName][appState.mode] ? renderers[layerName][appState.mode][propertyName] : undefined;
  const customPage = renderers[layerName][appState.mode + "-" + appState.pageLocation] ? renderers[layerName][appState.mode + "-" + appState.pageLocation][propertyName] : undefined;

  if (customPage !== undefined) {
    return customPage;
  }

  if (customMode !== undefined) {
    return customMode;
  }
  
  return defaultProps;
}
