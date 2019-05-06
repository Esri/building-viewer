/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import HomeSection = require("./sections/HomeSection");
import FloorsSection = require("./sections/FloorsSection");
import SurroundingsSection = require("./sections/SurroundingsSection");

export const websceneId = "b753b2ba04ef477ca46a5b8bd9766d2d";

export const sections = [
   // Check the different files
   // to adapt to your need
   // or create a new section by
   // implement a subclass from `Section`
   
   // The about Tarangua section:
   new HomeSection(),
   // The different floors:
   new FloorsSection(),
   // Surroundings:
   new SurroundingsSection()
];

export const surroundingsLayerTitle = "City Model Christchurch";
export const buildingLayerTitle = "Turanga Library";
