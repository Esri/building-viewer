import WebScene = require("esri/WebScene");
import SceneView = require("esri/views/SceneView");
import { backgroundColor } from "./visualVariables";
import Layer = require("esri/layers/Layer");

export function createView(args: {mapContainer: string, layers?: Layer[]}) {
  if (!args.layers) {
    args.layers = [];
  }
  // Load webscene and display it in a SceneView
  const webscene = new WebScene({
    //  portalItem: { // autocasts as new PortalItem()
    //   id: "f129776908594b0baa1c8fe21cda5c38",  // ID of the WebScene on arcgis.com
    //   portal: {
    //     url: "https://zrh.mapsdevext.arcgis.com"
    //   }
    // },
    basemap: null,
    layers: args.layers,
    ground:{ 
      surfaceColor: backgroundColor
    }
  });

  const view = new SceneView({
    container: args.mapContainer,
    map: webscene,
    alphaCompositingEnabled: true,
    environment: {
      starsEnabled: false,
      atmosphereEnabled: false,
      lighting: {
        directShadowsEnabled: true,
        ambientOcclusionEnabled: false
      },
      background: {
        type: "color",
        color: backgroundColor
      }
    }
  });

  view.ui.empty("top-left");
  view.ui.empty("bottom-left");

  return view;
}
