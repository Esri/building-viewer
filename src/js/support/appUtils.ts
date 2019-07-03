import WebScene = require("esri/WebScene");
import SceneView = require("esri/views/SceneView");
import Layer = require("esri/layers/Layer");
import Collection = require("esri/core/Collection");
import config = require("../config");
import PortalItem = require("esri/portal/PortalItem");
import Portal = require("esri/portal/Portal");

export function createViewFromWebScene(args: {
  mapContainer: string, 
  websceneId: string
}) {

  const portalItem = new PortalItem({
    id: args.websceneId
  });

  // Let user add portal parameter
  if (config.portalUrl) {
    portalItem.portal = new Portal({
      url: config.portalUrl
    });
  }

  // Load webscene and display it in a SceneView
  const webscene = new WebScene({
    portalItem
  });

  const view = new SceneView({
    container: args.mapContainer,
    map: webscene
  });

  view.when(() => {
    view.padding = { left: 300 };
    view.popup.autoOpenEnabled = false;
  });

  // Remove default ui:
  view.ui.empty("top-left");
  view.ui.empty("bottom-left");

  return view;
}


export function findLayer(layers: Collection<Layer>, title: string) {
  return layers.find(l => l.title === title);
}

export const CITY_LAYER_PREFIX = "City model";
export const MAIN_LAYER_PREFIX = "Building";
export const FLOOR_POINTS_LAYER_PREFIX = "Floor points";
export const INTERNAL_INFOPOINTS_LAYER_PREFIX = "Floor pictures";
export const EXTERNAL_INFOPOINT_LAYER_PREFIX = "External pictures";
export const SURROUNDINGS_LAYER_PREFIX = "Surroundings:";
