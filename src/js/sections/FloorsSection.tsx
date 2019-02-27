/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import Section = require("./Section");
import Camera = require("esri/Camera");
import Collection = require("esri/core/Collection");
import Widget = require("esri/widgets/Widget");
import FloorSelector = require("../widgets/FloorSelector/FloorSelector");
import watchUtils = require("esri/core/watchUtils");
import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Legend = require("esri/widgets/Legend");

import domCtr = require("dojo/dom-construct");
import domClass = require("dojo/dom-class");

// const floorViewInitialCamera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570670.452701511,"y":5180244.367632804,"z":208.91035901793373},"heading":0,"tilt":0.5000000009642485});
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

  featureLayer: FeatureLayer;

  render() {
    return this.content;
  }

  constructor(args: any) {
    super(args);
    this.featureLayer = new FeatureLayer({
      url: args.layer
    });
  }

  activate(view: SceneView, legend: Legend) {
    view.map.layers.add(this.featureLayer);
    legend.layerInfos = [{
      layer: this.featureLayer,
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
  previousSelectedFloor: number;

  @property()
  floorSelector: FloorSelector;

  @property()
  legend: Legend;

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
      content: (<div id="creativity" bind={this} key={this}><p><a href="">Auahatanga | Creativity</a> <span class="italic">level 4</span> <span>Browse the World Languages, Music and Fiction collections, including Biographies and Graphic Novels. Visit the two roof gardens with great views across the city. Explore your creativity in the Production Studio using creative technology such as 3D printers and sewing machines. Create and edit music and video using the Audio/Video Studio, or take a class in the Computer Labs with a great range of software available.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    })
  ]);

  @property()
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570527.3036612223,"y":5180359.178648159,"z":86.69521235276355},"heading":124.3049960081546,"tilt":73.36076191888827});
  // ipad friendlier camera: 
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570670.452701511,"y":5180244.367632804,"z":208.91035901793373},"heading":0,"tilt":0.5000000007083909})
  //{"position":{"spatialReference":{"wkid":2193},"x":1570544.291609822,"y":5180361.938219893,"z":71.53173486068152},"heading":124.30499600935663,"tilt":73.36076191907371});
  camera = new Camera({"position":{"spatialReference":{"wkid":102100},"x":19217882.83777959,"y":-5393018.66464356,"z":163.67941159475595},"heading":359.9999957311318,"tilt":0.49998993117987317})

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

      this.legend = new Legend({
        view: this.appState.view,
        layerInfos: [],
        container: domCtr.create("div", null, "floorLegend")
      });

      watchUtils.init(this, "selectedFloor,appState.pageLocation", () => {
        if (typeof this.selectedFloor == 'number') {
          if (this.previousSelectedFloor) {
            this.appState.view.map.layers.remove(this.floors.getItemAt(this.previousSelectedFloor).featureLayer);
          }
          this.previousSelectedFloor = this.selectedFloor;
          this.floors.getItemAt(this.selectedFloor).activate(this.appState.view, this.legend);
          this.floors.getItemAt(this.selectedFloor).featureLayer.visible = (this.appState.pageLocation === "floors");
        }
      });
    });
  }

  onEnter() {
    this.selectedFloor = 0;
    domClass.remove("floorLegend", "hide");
    this.appState.view.environment.lighting.directShadowsEnabled = false;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = false;
    // this.floors.getItemAt(this.selectedFloor).activate(this.floorView, this.legend);

  }

  onLeave() {
    domClass.add("floorLegend", "hide");
    this.appState.view.environment.lighting.directShadowsEnabled = true;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = true;
  }
}

export = FloorsSection;
