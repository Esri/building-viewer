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
import { tsx } from "esri/widgets/support/widget";
import AppState from "../../AppState";
import Widget from "esri/widgets/Widget";
import WebScene from "esri/WebScene";
import Collection from "esri/core/Collection";
import * as watchUtils from "esri/core/watchUtils";
import Handles from "esri/core/Handles";
import OneViewpoint from "./OneViewpoint";

@subclass("widgets/Viewpoints")
class Viewpoints extends Widget {
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
