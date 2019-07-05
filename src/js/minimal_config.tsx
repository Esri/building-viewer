/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import HomeSection = require("./sections/HomeSection");
import { FloorsSection } from "./sections/FloorsSection";
import SurroundingsSection = require("./sections/SurroundingsSection");
export const portalUrl = "https://zurich.maps.arcgis.com";
export const websceneId = "8174c171ff234fdeb8700c409b5ab8f7";

export const sections = [
   new HomeSection({}),
   new FloorsSection({
     minFloor: 0,
     maxFloor: 2
   }),
   new SurroundingsSection({})
];
