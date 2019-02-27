/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");
import SceneView = require("esri/views/SceneView");
import BuildingVisualisation = require("./support/BuildingVisualisation");
import SurroundingsVisualisation = require("./support/SurroundingsVisualisation");

@subclass("AppState")
class AppState extends declared(Accessor) {
  @property()
  mode: "schematic" | "real" = "schematic";

  @property()
  pageLocation: string;

  @property()
  floorNumber: number = 0;

  @property()
  view: SceneView;

  @property()
  buildingLayer: BuildingVisualisation;

  @property()
  surroundingsLayer: SurroundingsVisualisation;
}

export = AppState;
