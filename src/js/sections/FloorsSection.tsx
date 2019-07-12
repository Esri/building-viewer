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
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Section = require("./Section");
import Collection = require("esri/core/Collection");
import Widget = require("esri/widgets/Widget");
import FloorSelector = require("../widgets/FloorSelector/FloorSelector");
import watchUtils = require("esri/core/watchUtils");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Legend = require("esri/widgets/Legend");
import PopupInfo = require("../widgets/Popup/PopupInfo");
import appUtils = require("../support/appUtils");
import Handles = require("esri/core/Handles");
import AppState = require("../AppState");

@subclass()
class LegendWrapper extends declared(Widget) {
  @property()
  @renderable()
  hide: boolean = true;

  @property({ constructOnly: true })
  appState: AppState;

  @property()
  @renderable()
  legend: Legend;

  constructor(args: { appState: AppState }, container: string) {
    super(args as any);
  }

  postInitialize() {
    this.legend = new Legend({
      view: this.appState.view,
      layerInfos: []
    });
  }

  render() {
    return (<div class={this.classes({"hide": this.hide})}>
      {this.legend.render()}
    </div>);
  }
}


@subclass()
class PlayButton extends declared(Widget) {
  @property()
  @renderable()
  playing: boolean = false;

  @property()
  audioSrc: string;

  @property({dependsOn: ["audioSrc"], readOnly: true })
  get audio() {
    return new Audio(this.audioSrc);
  }

  postInitialize() {
    this.watch("audio", audio => {
      audio.addEventListener("ended", () => {
        audio.currentTime = 0;
        this.playing = false;
      });
    });
  }

  render() {
    const dynamicCss = {
      "playing": this.playing
    };

    return (
      <button class={this.classes(dynamicCss, "play_button")} onclick={this.onClick} bind={this} key={this}>
        <i class="play_button__icon">
          <div class="play_button__mask"/>
        </i>
      </button>
    );
  }

  onClick(event: Event) {
    if (this.playing) {
      this.playing = false;
      this.audio.pause();
    }
    else {
      this.audio.play();
      this.playing = true;
    }
  }
}

interface FloorCtorArgs {
  title: string;
  subtitle: string;
  content: (that: Floor) => any;
  floor: number;
  audio?: string;
}

interface FloorsSectionCtorArgs {
  floors?: Collection<Floor>;
}

interface FloorsSectionCtorArgs2 {
  minFloor: number;
  maxFloor: number;
}

@subclass()
export class Floor extends declared(Widget) {
  @property()
  title: string;

  @property()
  content: (that: this) => any;

  @property()
  subtitle: string;

  @property()
  floor = 1;

  @property({aliasOf: "playButton.audioSrc"})
  audio: string;

  @property()
  playButton = new PlayButton();

  render() {
    const audio = this.audio ? (<p>Listen to the name of this floor {this.playButton.render()}</p>) : null;
    return (<div>
      {this.content(this)}
      {audio}
    </div>);
  }

  constructor(args: FloorCtorArgs) {
    super(args as any);
  }

  activate() {
    // put audio back to 0
    this.playButton.audio.currentTime = 0;
  }
}

@subclass("sections/FloorsSection")
export class FloorsSection extends declared(Section) {
  @property()
  title = "Floor by floor";

  @property()
  id = "floors";

  @property({ aliasOf: "appState.floorNumber"})
  selectedFloor: number;

  private oldDate: Date;

  @property()
  previousSelectedFloor: number;

  @property()
  floorSelector: FloorSelector;

  @property()
  legendWrapper: LegendWrapper;

  @property()
  layer: FeatureLayer;

  @property({constructOnly: true })
  layerNameForInfoPoint = appUtils.FLOOR_POINTS_LAYER_PREFIX;

  @property({constructOnly: true })
  layerNameForPicturePoint = appUtils.INTERNAL_INFOPOINTS_LAYER_PREFIX;

  @property()
  picturePointsLayer: FeatureLayer;

  @property()
  minFloor: number;

  @property()
  maxFloor: number;

  private handles = new Handles();

  @property({constructOnly: true})
  floors: Collection<Floor>;

  render() {
    const currentLevel = this.floors ? this.floors.getItemAt(this.selectedFloor) : null;
    const selectedFloor = this.selectedFloor === 0 ? "G" : this.selectedFloor;
    const title = currentLevel ? this.selectedFloor === 0 ? (<h1>{currentLevel.title}</h1>) : (<h1>{currentLevel.title}</h1>) : null;
    return currentLevel ? (<div id={this.id} bind={this} key={this}>
      <div class="level">floor</div>
      <h1 class="number">{selectedFloor}</h1>
      {title}
      <h3 class="subtitle">[{currentLevel.subtitle}]</h3>
      <div class="content">{currentLevel.render()}</div>
    </div>) : null;
  }

  paneRight() {
    const floorSelector = this.floorSelector ? this.floorSelector.render() : null;
    return (<div>{floorSelector}</div>);
  }

  constructor(args: FloorsSectionCtorArgs | FloorsSectionCtorArgs2) {
    super(args as any);
  }

  postInitialize() {
    watchUtils.whenOnce(this, "appState", () => {
      this.legendWrapper = new LegendWrapper({
        appState: this.appState
      }, "floorLegend");

      const floorSelectorCtorArgs = this.minFloor != null &&  this.maxFloor != null ? {
        appState: this.appState,
        minFloor: this.minFloor,
        maxFloor: this.maxFloor
      } : {
        appState: this.appState
      }

      this.floorSelector = new FloorSelector(floorSelectorCtorArgs);

      watchUtils.on(this, "appState.view.map.layers", "change", this.getExtraInfoLayers.bind(this));

      watchUtils.init(this, "selectedFloor", (selectedFloor) => {
        if (this.floors) {
          this.floors.getItemAt(selectedFloor).activate();
        }

        // filter the picture and infoLayer:
        if (this.layer) {
          this.layer.definitionExpression = "level_id = " + selectedFloor;
        }

        if (this.picturePointsLayer) {
          this.picturePointsLayer.definitionExpression = "level_id = " + selectedFloor;
        }
      });
    });
  }

  onEnter() {
    this.selectedFloor = 1;

    if (this.floors) {
      this.floors.getItemAt(this.selectedFloor).activate();
    }

    this.appState.view.environment.lighting.directShadowsEnabled = false;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = false;
    this.oldDate = this.appState.view.environment.lighting.date;
    this.appState.view.environment.lighting.date = new Date("Thu Aug 01 2019 03:00:00 GMT+0200 (Central European Summer Time)");
    this.handles.add(this.appState.view.on("click", (event: any) => {
     // the hitTest() checks to see if any graphics in the view
     // intersect the given screen x, y coordinates
     this.appState.view.hitTest(event)
      .then((response) => {
        const filtered = response.results.filter((result: any) => {
          return result.graphic.layer === this.picturePointsLayer;
        })[0];
        if (filtered) {
          this.appState.popupInfo = new PopupInfo({
            image: filtered.graphic.attributes.url,
            credit: filtered.graphic.attributes.title
          });
        }
      });
    }), "click");

    this.legendWrapper.hide = !this.layer;

    if (this.layer) {
      this.layer.visible = true;
    }

    if (this.picturePointsLayer) {
      this.picturePointsLayer.visible = true;
    }

  }

  onLeave() {
    this.handles.remove("click");
    this.appState.view.environment.lighting.directShadowsEnabled = true;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = true;
    this.appState.view.environment.lighting.date = this.oldDate;

    this.legendWrapper.hide = true;

    if (this.layer) {
      this.layer.visible = false;
    }

    if (this.picturePointsLayer) {
      this.picturePointsLayer.visible = false;
    }
  }

  private getExtraInfoLayers() {
    if (this.appState && this.appState.view.map.layers.length > 0) {
        // Get the info points on the floors:
        if (!this.layer) {
          this.layer = appUtils.findLayer(this.appState.view.map.layers, this.layerNameForInfoPoint) as FeatureLayer;
          if (this.layer) {
            this.layer.visible = false;
            this.legendWrapper.legend.layerInfos = [
              {
                layer: this.layer,
                title: "Legend"
              }
            ];
          }
        }
        // Get extra pictures:
        if (!this.picturePointsLayer) {
          this.picturePointsLayer = appUtils.findLayer(this.appState.view.map.layers, this.layerNameForPicturePoint) as FeatureLayer;
          if (this.picturePointsLayer) {
            this.picturePointsLayer.visible = false;
            this.picturePointsLayer.outFields = ["*"];
          }
        }
        
      }
  }
}
