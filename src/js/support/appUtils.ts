import WebScene = require("esri/WebScene");
import SceneView = require("esri/views/SceneView");
import { backgroundColor } from "./visualVariables";
import Layer = require("esri/layers/Layer");
import Collection = require("esri/core/Collection");

export function createViewFromWebScene(args: {
  mapContainer: string, 
  websceneId: string
}) {

  // Load webscene and display it in a SceneView
  const webscene = new WebScene({
     portalItem: {
      id: args.websceneId,
      portal: {
        url: "https://zrh.mapsdevext.arcgis.com"
      }
    },
    basemap: null,
  });

  const view = new SceneView({
    container: args.mapContainer,
    map: webscene,
    alphaCompositingEnabled: true
  });

  webscene.when(function() {
    webscene.basemap = null;
    webscene.ground.surfaceColor = backgroundColor;
  });

  view.when(() => {
    view.environment.lighting.directShadowsEnabled = true;
    view.environment.lighting.ambientOcclusionEnabled = true;
    view.environment.starsEnabled = false;
    (view.environment.background as any) = {
      type: "color",
      color: [0,0,0,0] as any
    };
    view.map.ground.surfaceColor =  [0,0,0,0] as any;
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
