/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");

@subclass()
class PopupInfo extends declared(Accessor) {
  @property()
  image: string;

  @property()
  credit: string;
}

export = PopupInfo;
