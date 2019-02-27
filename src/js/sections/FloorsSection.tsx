/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import Section = require("./Section");
import Camera = require("esri/Camera");
import Color = require("esri/Color");
import Collection = require("esri/core/Collection");
import Widget = require("esri/widgets/Widget");
import FloorSelector = require("../widgets/FloorSelector/FloorSelector");
import watchUtils = require("esri/core/watchUtils");
import appUtils = require("../support/appUtils");
import SceneView = require("esri/views/SceneView");
import BuildingVisualisation = require("../support/BuildingVisualisation");
import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import FeatureLayer = require("esri/layers/FeatureLayer");
import WatchHandles = require("esri/core/Handles");
import { backgroundColor } from "../support/visualVariables";
import Legend = require("esri/widgets/Legend");

import domClass = require("dojo/dom-class");
import domCtr = require("dojo/dom-construct");

const floorViewInitialCamera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570670.452701511,"y":5180244.367632804,"z":208.91035901793373},"heading":0,"tilt":0.5000000009642485});
// new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570696.7848733864,"y":5180244.998463141,"z":142.2325701501933},"heading":0,"tilt":0.5000000004590939});

@subclass()
class Floor extends declared(Widget) {
  @property()
  title: string;

  @property()
  content: string;

  @property()
  subtitle: string;

  @property()
  layer: string;

  render() {
    return this.content;
  }

  constructor(args: any) {
    super(args);
  }

  activate(view: SceneView, legend: Legend) {
    const featureLayer = new FeatureLayer({
      url: this.layer
    });
    view.map.layers = new Collection([
      view.map.layers.getItemAt(0),
      featureLayer
    ]);
    legend.layerInfos = [{
      layer: featureLayer,
      title: "Legend"
    }];
  }
}

@subclass("sections/FloorsSection")
class FloorsSection extends declared(Section) {
  @property()
  title = "Floors";

  @property()
  id = "floors";

  @property({ aliasOf: "appState.floorNumber"})
  selectedFloor: number;

  @property()
  floorSelector: FloorSelector;

  @property()
  floorView: SceneView;

  @property()
  buildingLayer: BuildingVisualisation;

  @property()
  buildingLayerUrl: string;

  @property()
  legend: Legend;

  // private offsetX: number;
  // private offsetY: number;

  private _handles = new WatchHandles();

  floors: Collection<Floor> = new Collection([
    new Floor({
      title: "He Hononga",
      subtitle: "connection",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="connection" bind={this} key={this}><p><a href="">He Hononga | Connection</a> <span class="italic">ground level</span> <span>Open an hour earlier than the rest of the building on weekdays, He Hononga | Connection, Ground Level is the place to return library items, collect holds, browse magazines, DVDs and new arrivals, visit the café or interact with the Discovery Wall.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Hapori",
      subtitle: "community",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="community" bind={this} key={this}><p><a href="">Hapori | Community</a> <span class="italic">level 1</span> <span> offers experiences geared towards a wide cross-section of our community. Grab a hot drink at the espresso bar, attend an event in our community arena, or help the kids explore the play and craft areas and children’s resources. It’s also a great place for young adults to hang out, play videogames, try out VR or get some study done.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Tuakiri",
      subtitle: "identity",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="identity" bind={this} key={this}><p><a href="">Tuakiri | Identity</a> <span class="italic">level 2</span> <span>Find resources and services to help you develop your knowledge about your own identity, your ancestors, your whakapapa and also about the place that they called home – its land and buildings.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Tūhuratanga",
      subtitle: "discovery",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="discovery" bind={this} key={this}><p><a href="">Tūhuratanga | Discovery</a> <span class="italic">level 3</span> <span>Explore the nonfiction collection with thousands of books on a huge range of subjects. Get help with print and online resources for research or recreation. Use the public internet computers or, for those who want a low-key space to read or study, there is a separate room called &lsquo;The Quiet Place&rsquo;. Study, research or browse for some recreational reading.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Auahatanga",
      subtitle: "creativity",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="creativity" bind={this} key={this}><p><a href="">Auahatanga | Creativity</a> <span class="italic">level 4</span> Browse the World Languages, Music and Fiction collections, including Biographies and Graphic Novels. Visit the two roof gardens with great views across the city. Explore your creativity in the Production Studio using creative technology such as 3D printers and sewing machines. Create and edit music and video using the Audio/Video Studio, or take a class in the Computer Labs with a great range of software available.</p><p>Listen to the name of this floor [MP3]</p></div>)
    })
  ]);

  @property()
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570527.3036612223,"y":5180359.178648159,"z":86.69521235276355},"heading":124.3049960081546,"tilt":73.36076191888827});
  // ipad friendlier camera: 
  camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570544.291609822,"y":5180361.938219893,"z":71.53173486068152},"heading":124.30499600935663,"tilt":73.36076191907371});

  render() {
    const currentLevel = this.floors.getItemAt(this.selectedFloor);
    const selectedFloor = this.selectedFloor === 0 ? "G" : this.selectedFloor;
    const title = this.selectedFloor === 0 ? (<h1>{currentLevel.title}</h1>) : (<h1><br/>{currentLevel.title}</h1>);
    return (<div id={this.id} bind={this} key={this}>
      <div class="level">level</div>
      <h1 class="number">{selectedFloor}</h1>
      {title}
      <h3 class="subtitle">{currentLevel.subtitle}</h3>
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
    });

    watchUtils.init(this, "selectedFloor", (selectedFloor) => {
      if (this.floorView) {
        watchUtils.whenOnce(this, "legend", () => {
          this.floors.getItemAt(selectedFloor).activate(this.floorView, this.legend);
        });
      }
    });
  }

  onEnter() {
    this.selectedFloor = 0;
    this.buildingLayer = new BuildingVisualisation({
      appState: this.appState,
      layer: this.buildingLayerUrl
    });

    this.floorView = appUtils.createView({
      mapContainer: "floorViewDiv",
      layers: [
        this.buildingLayer
      ]
    });
    this.appState.view.environment.lighting.directShadowsEnabled = false;
    this.appState.view.map.ground.surfaceColor = new Color([0, 0, 0, 0]);
    this.appState.view.environment.background = {
      type: "color",
      color: new Color([0, 0, 0, 0])
    } as any;

    this.floorView.when(() => {
      // this.floorView.camera = floorViewInitialCamera.clone();
      // this.offsetX = this.appState.view.camera.position.x - this.floorView.camera.position.x;
      // this.offsetY = this.appState.view.camera.position.y - this.floorView.camera.position.y;

      // this._handles.add(this.watch("floorView.interacting", () => {
      //   const camera = this.appState.view.camera.clone();
      //   camera.position.x = this.floorView.camera.position.x + this.offsetX;
      //   camera.position.y = this.floorView.camera.position.y + this.offsetY;
      //   this.appState.view.goTo(camera);
      // }), "floorView");

      // this._handles.add(this.watch("appState.view.interacting", () => {
      //   const camera = this.floorView.camera.clone();
      //   camera.position.x = this.appState.view.camera.position.x - this.offsetX;
      //   camera.position.y = this.appState.view.camera.position.y - this.offsetY;
      //   this.floorView.goTo(camera);
      // }), "floorView");

      window["floorView"] = this.floorView;

      this.floorView.whenLayerView(this.buildingLayer).then(() => {
        this.buildingLayer.customBaseRenderer = new SimpleRenderer({
          symbol: {
            type: "mesh-3d",
            symbolLayers: [{
              type: "fill",
              material: { color: [255,255,255, 1], colorMixMode: "replace" },
              edges: {
                type: "solid", // autocasts as new SolidEdges3D()
                color: [30, 30, 30, 1]
              }
            }]
          }  as any
        });
      });

      this.floorView.goTo(floorViewInitialCamera);

      this.legend = new Legend({
        view: this.floorView,
        layerInfos: [],
        container: domCtr.create("div", null, "floorLegend")
      });

      this.floors.getItemAt(this.selectedFloor).activate(this.floorView, this.legend);
    });

    domClass.add("canvas", "floors");

  }

  onLeave() {
    if (this.floorView) {
      this.floorView.destroy();
      this.floorView = null;
    }
    if (this.buildingLayer) {
      this.buildingLayer.destroy();
      this.buildingLayer = null;
    }
    if (this.legend) {
      this.legend.destroy();
      this.legend = null;
    }

    this.appState.view.map.ground.surfaceColor = backgroundColor;
    this.appState.view.environment.background = {
      type: "color",
      color: backgroundColor
    } as any;
    this._handles.remove("floorView");
    domClass.remove("canvas", "floors");
  }
}

export = FloorsSection;
