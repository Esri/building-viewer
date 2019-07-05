/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import AppState = require("../../AppState");
import Widget = require("esri/widgets/Widget");
import WebScene = require("esri/WebScene");
import Collection = require("esri/core/Collection");
import watchUtils = require("esri/core/watchUtils");
import Handles = require("esri/core/Handles");
import OneViewpoint = require("./OneViewpoint");

@subclass("widgets/Viewpoints")
class Viewpoints extends declared(Widget) {
  @property()
  appState: AppState;

  private handles = new Handles();

  @property()
  set activeViewpoint(viewpointToActivate: OneViewpoint) {
    this.slides.forEach(viewpoint => {
      if (viewpoint !== viewpointToActivate) {
        viewpoint.active = false;
      }
      else {
        viewpoint.active = true;
      }
    });
    this._set("activeViewpoint", viewpointToActivate);
  }

  @property({readOnly: true, dependsOn: ["appState.view.map.presentation.slides"]})
  @renderable()
  get slides(): Collection<OneViewpoint> {
    return this.appState ? 
      (this.appState.view.map as WebScene).presentation.slides
        .map((s) => new OneViewpoint({slide: s, appState: this.appState})) 
      : new Collection();
  }

  constructor(args: any) {
    super(args);
  }

  render() {
    const items = this.slides.length > 0 ? this.slides.map((s) => s.render()).toArray() : null;
    return this.slides.length > 0 ? (<div bind={this} key={this} class="viewpoints">
      <h2 class="slash-title">Point of view</h2>
      <ul>
        {items}
      </ul>
    </div>) : null;
  }

  postInitialize() {
    (this.appState.view.map as WebScene).presentation.slides.on("change", () => this.notifyChange("slides"));
    this.slides.on("change", this.watchActiveSlide.bind(this));
    this.watchActiveSlide();
  }

  watchActiveSlide() {
    this.handles.removeAll();
    this.slides.forEach(s => {
      this.handles.add(
        watchUtils.init(s, "active", (active) => {
          if (active) {
            this.activeViewpoint = s;
          }
        }),
        "active"
      );
    });
  }
}

export = Viewpoints;
