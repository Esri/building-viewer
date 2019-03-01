import WebScene = require("esri/WebScene");
import SceneView = require("esri/views/SceneView");
import { backgroundColor } from "./visualVariables";
import Layer = require("esri/layers/Layer");
import Collection = require("esri/core/Collection");

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
        color: [0,0,0,0] as any
      }
    }
  });

  view.ui.empty("top-left");
  view.ui.empty("bottom-left");

  return view;
}

export function createViewFromWebScene(args: {
  mapContainer: string, 
  websceneId: string
}) {

  // Load webscene and display it in a SceneView
  const webscene = new WebScene({
     portalItem: { // autocasts as new PortalItem()
      id: args.websceneId,  // ID of the WebScene on arcgis.com
      portal: {
        url: "https://zrh.mapsdevext.arcgis.com"
      }
    },
    basemap: null,
    // ground:{ 
    //   surfaceColor: backgroundColor
    // }
  });

  webscene.when(function() {
    webscene.basemap = null;
    webscene.ground.surfaceColor = backgroundColor;
  });

  const view = new SceneView({
    container: args.mapContainer,
    map: webscene,
    alphaCompositingEnabled: true
    // environment: {
    //   starsEnabled: false,
    //   atmosphereEnabled: true,
    //   lighting: {
    //     directShadowsEnabled: true,
    //     ambientOcclusionEnabled: true
    //   },
    //   background: {
    //     type: "color",
    //     color: backgroundColor
    //   }
    // }
  });

  view.ui.empty("top-left");
  view.ui.empty("bottom-left");

  return view;
}


export function findLayer(layers: Collection<Layer>, title: string) {
  return layers.find(l => l.title === title);
}
