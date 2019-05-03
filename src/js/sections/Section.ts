/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Camera = require("esri/Camera");
import Widget = require("esri/widgets/Widget");

import AppState = require("../AppState");

@subclass("sections/Section")
abstract class Section extends declared(Widget) {
  @property()
  appState: AppState;

  @property()
  abstract title: string;

  @property()
  abstract id: string;

  @property()
  camera: Camera;

  @property()
  active: boolean = false;

  abstract render(): JSX.Element;

  abstract paneRight(): JSX.Element;

  onEnter() {}

  onLeave() {}

  postInitialize() {
    this.own(this.watch("camera", camera => {
      if (camera) {
        this.emit("go-to", camera);
      }
    }));
  }
}

export = Section;
