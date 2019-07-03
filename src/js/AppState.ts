/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");
import SceneView = require("esri/views/SceneView");
import BuildingVisualisation = require("./support/BuildingVisualisation");
import PopupInfo = require("./widgets/Popup/PopupInfo");

@subclass("AppState")
class AppState extends declared(Accessor) {
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
