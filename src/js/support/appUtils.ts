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
import WebScene = require("esri/WebScene");
import SceneView = require("esri/views/SceneView");
import Layer = require("esri/layers/Layer");
import Collection = require("esri/core/Collection");
import PortalItem = require("esri/portal/PortalItem");
import Portal = require("esri/portal/Portal");

export function createViewFromWebScene(args: {
  mapContainer: string, 
  websceneId: string,
  portalUrl?: string
}) {

  const portalItem = new PortalItem({
    id: args.websceneId
  });

  // Let user add portal parameter
  if (args.portalUrl) {
    portalItem.portal = new Portal({
      url: args.portalUrl
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
