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

import Section from "./Section";
import AppState from "../AppState";
import Collection from "esri/core/Collection";
import WebScene from "esri/WebScene";
import Camera from "esri/Camera";
import Widget from "esri/widgets/Widget";
import Toggle from "../widgets/Toggle/Toggle";
import * as watchUtils from "esri/core/watchUtils";
import FeatureLayer from "esri/layers/FeatureLayer";
import GroupLayer from "esri/layers/GroupLayer";
import * as appUtils from "../support/appUtils";

@subclass("SurroundingsElement")
class SurroundingsElement extends Widget {
  @property()
  toggle = new Toggle();

  @property({aliasOf: "toggle.active"})
  set active(isActive: boolean) {
    this.toggle.active = isActive;
  }
  get active() {
    return this.toggle.active;
  }

  @property()
  title: string;

  @property()
  layer: FeatureLayer | GroupLayer;

  @property()
  appState: AppState;

  @property()
  camera: Camera;

  activate() {
    this.appState.view.goTo(this.camera);
    if (this.layer) {
      this.layer.visible = true;
    }
  }

  deactivate() {
    if (this.layer) {
      this.layer.visible = false;
    }
  }

  content() {
    return (<div clas="content"></div>);
  }

  render() {
    return (<div key={this} class={this.classes("element", {"active": this.active})}>
      <h2 class="slash-title width-toggle" onclick={() => this.active = !this.active}>
        {this.toggle.render()}
        <a href="javascript:return;">{this.title}</a>
      </h2>
      <div clas="content">{this.content()}</div>
    </div>);
  }

  constructor(args: any) {
    super(args);

    if (args.content) {
      this.content = args.content.bind(this);
    }

    this.watch("active", (isActive) => {
      if (isActive) {
        this.activate();
      }
      else {
        this.deactivate();
      }
    });
  }
}

@subclass("PoIElement")
class PoIElement extends Widget {
  @property()
  camera: Camera;

  @property()
  name: string;

  constructor(args: {name: string, camera: Camera, appState: AppState}) {
    super(args as any);
  }

  @property()
  appState: AppState;

  render() {
    return (
      <div><span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span><a href="javascript: void(0)" onclick={this.onClick} bind={this} key={this}>{this.name}</a></div>
    );
  }

  onClick(event: Event) {
    this.appState.view.goTo(this.camera);
  }
}

@subclass("sections/SurroundingsSection")
class SurroundingsSection extends Section {
  @property()
  title = "Surroundings";

  @property()
  appState: AppState;

  @property()
  id = "surroundings";

  @property()
  poiElements: Collection<PoIElement>;

  @property({dependsOn: ["appState.view.map.layers", "poiElements"], readOnly: true})
    get elements() {
    if (this.appState && this.appState.view.map.layers.length > 0) {
      const elements = this.appState.view.map.layers
      .filter(layer => layer.title.indexOf(appUtils.SURROUNDINGS_LAYER_PREFIX) > -1)
      .map(layer => {

        layer.visible = false;

        return new SurroundingsElement({
          title: layer.title.replace("Surroundings: ", ""),
          layer: layer,
          appState: this.appState,
          camera: this.camera
        });
      });

      if (this.poiElements.length > 0) {
        elements.push(new SurroundingsElement({
          title: "Points of Interest",
          appState: this.appState,
          camera: this.camera,
          content: () => {
            const poiElementsItems = this.poiElements.map(el => el.render());
            return (<div class="content">
              {poiElementsItems.toArray()}
            </div>);
          }
        }));
      }

      return elements;
    }
    else {
      return new Collection<SurroundingsElement>();
    }

    
  }

  constructor(args: any) {
    super(args);

    this.own(watchUtils.whenOnce(this, "appState", () => {

      (this.appState.view.map as WebScene).when(() => {
      
        // Get the point of interests:
        this.poiElements = (this.appState.view.map as WebScene).presentation.slides
        .filter(slide => slide.title.text.indexOf("Points of Interest:") > -1)
        .map(slide => {
          (this.appState.view.map as WebScene).presentation.slides.remove(slide);
          return new PoIElement({
            name: slide.title.text.replace("Points of Interest: ", ""),
            camera: slide.viewpoint.camera,
            appState: this.appState
          });
        });

        watchUtils.on(this.appState, "view.map.layers", "change", () => this.notifyChange("elements"));
        watchUtils.on(this, "poiElements", "change", () => this.notifyChange("elements"));
      });
    }));
  }

  render() {
    return (<div id={this.id} key={this}>
      <h1>Surroundings</h1>
      {this.elements.map(l => l.render()).toArray()}
    </div>);
  }

  paneRight() {
    return (<div></div>);
  }

  onEnter() {
    this.elements.forEach(el => el.active = el.title === "Points of Interest");
  }

  onLeave() {
    this.elements.forEach(e => e.active = false);
  }
}

export = SurroundingsSection;
