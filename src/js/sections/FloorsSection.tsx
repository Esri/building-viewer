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
  hide: boolean = false;

  @property({ constructOnly: true })
  appState: AppState;

  @property()
  @renderable()
  legend: Legend;

  constructor(args: { appState: AppState }, container: string) {
    super(args as any);
  }

  postInitialised() {
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

  featureLayer: FeatureLayer;

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

  activate(infoLayer: FeatureLayer, pictureLayer: FeatureLayer) {
    // put audio back to 0
    this.playButton.audio.currentTime = 0;

    // filter the picture and infoLayer:
    if (infoLayer) {
      infoLayer.definitionExpression = "level_id = " + this.floor;
    }

    if (pictureLayer) {
      pictureLayer.definitionExpression = "level_id = " + this.floor;
    }
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
  layerNameForInfoPoint = appUtils.INTERNAL_INFOPOINTS_LAYER_PREFIX;

  @property({constructOnly: true })
  layerNameForPicturePoint = appUtils.FLOOR_POINTS_LAYER_PREFIX;

  @property()
  picturePointsLayer: FeatureLayer;

  private handles = new Handles();

  @property({constructOnly: true})
  floors: Collection<Floor>;

  render() {
    const currentLevel = this.floors.getItemAt(this.selectedFloor);
    const selectedFloor = this.selectedFloor === 0 ? "G" : this.selectedFloor;
    const title = this.selectedFloor === 0 ? (<h1>{currentLevel.title}</h1>) : (<h1>{currentLevel.title}</h1>);
    return (<div id={this.id} bind={this} key={this}>
      <div class="level">floor</div>
      <h1 class="number">{selectedFloor}</h1>
      {title}
      <h3 class="subtitle">[{currentLevel.subtitle}]</h3>
      <div class="content">{currentLevel.render()}</div>
    </div>);
  }

  paneRight() {
    const floorSelector = this.floorSelector ? this.floorSelector.render() : null;
    return (<div>{floorSelector}</div>);
  }

  constructor(args: any) {
    super(args);
    this.selectedFloor = 0;
    
    watchUtils.whenOnce(this, "appState", (appState) => {
      this.floorSelector = new FloorSelector({appState: appState});
      watchUtils.on(this, "appState.view.map.layers", "change", () => {
        if (this.appState && this.appState.view.map.layers.length > 0) {

          // Get the info points:
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

          if (!this.picturePointsLayer) {
            this.picturePointsLayer = appUtils.findLayer(this.appState.view.map.layers, this.layerNameForPicturePoint) as FeatureLayer;
            if (this.picturePointsLayer) {
              this.picturePointsLayer.visible = false;
              this.picturePointsLayer.outFields = ["*"];
              this.picturePointsLayer.popupTemplate.overwriteActions = true;
              this.picturePointsLayer.popupTemplate.actions = new Collection();
            }
          }
          
        }
      });

      watchUtils.init(this, "selectedFloor,appState.pageLocation", () => {
        if (typeof this.selectedFloor === 'number' && this.layer) {
          this.floors.getItemAt(this.selectedFloor).activate(this.layer, this.picturePointsLayer);
          
          if (this.layer) {
            this.layer.visible = (this.appState.pageLocation === "floors");
          }

          if (this.picturePointsLayer) {
            this.picturePointsLayer.visible = (this.appState.pageLocation === "floors");
          }
        }
      });
    });
  }

  postInitialised() {
    this.legendWrapper = new LegendWrapper({
      appState: this.appState
    }, "floorLegend");
  }

  onEnter() {
    this.selectedFloor = 1;
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

  }

  onLeave() {
    this.handles.remove("click");
    this.appState.view.environment.lighting.directShadowsEnabled = true;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = true;
    this.appState.view.environment.lighting.date = this.oldDate;
  }
}
