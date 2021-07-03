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
import SceneView from "esri/views/SceneView";
import BuildingVisualisation from "./support/BuildingVisualisation";
import PopupInfo from "./widgets/Popup/PopupInfo";

@subclass("AppState")
class AppState extends Accessor {
  @property()
  pageLocation: string;

  @property()
  floorNumber = 0;

  @property()
  view: SceneView;

  @property()
  buildingLayer: BuildingVisualisation;

  @property()
  popupInfo: PopupInfo;
}

export = AppState;
