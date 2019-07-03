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

export const MAIN_BSL_PREFIX = "Main BSL:";
export const EXTRA_LAYER_PREFIX = "Extra:";
export const EXTERNAL_INFOPOINT_LAYER_PREFIX = "External infopoints:";
