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
// import SceneView = require("esri/views/SceneView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Legend = require("esri/widgets/Legend");
import PopupTemplate = require("esri/PopupTemplate");
import domCtr = require("dojo/dom-construct");
import domClass = require("dojo/dom-class");
import appUtils = require("../support/appUtils");
import Handles = require("esri/core/Handles");
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
  level = 1;

  // @property()
  // layer: string;

  featureLayer: FeatureLayer;

  render() {
    return this.content;
  }

  constructor(args: any) {
    super(args);
  }

  // activate(view: SceneView, legend: Legend) {
  activate(layer: FeatureLayer) {
    // view.map.layers.add(this.featureLayer);
    // legend.layerInfos = [{
    //   layer: this.featureLayer,
    //   title: "Legend"
    // }];
    if (layer) {
      layer.definitionExpression = "level_id = " + this.level;
    }
  }
}

@subclass("sections/FloorsSection")
class FloorsSection extends declared(Section) {
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
  legend: Legend;

  @property()
  layer: FeatureLayer;

  private handles = new Handles();

  floors: Collection<Floor> = new Collection([
    new Floor({
      title: "He Hononga",
      subtitle: "connection",
      level: 0,
      // layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="connection" bind={this} key={this}><p><a href="">He Hononga | Connection</a> <span class="italic">ground level</span> <span>Open an hour earlier than the rest of the building on weekdays, He Hononga | Connection, Ground Level is the place to return library items, collect holds, browse magazines, DVDs and new arrivals, visit the café or interact with the Discovery Wall.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Hapori",
      subtitle: "community",
      level: 1,
      // layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="community" bind={this} key={this}><p><a href="">Hapori | Community</a> <span class="italic">level 1</span> <span> offers experiences geared towards a wide cross-section of our community. Grab a hot drink at the espresso bar, attend an event in our community arena, or help the kids explore the play and craft areas and children’s resources. It’s also a great place for young adults to hang out, play videogames, try out VR or get some study done.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Tuakiri",
      subtitle: "identity",
      level: 2,
      // layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="identity" bind={this} key={this}><p><a href="">Tuakiri | Identity</a> <span class="italic">level 2</span> <span>Find resources and services to help you develop your knowledge about your own identity, your ancestors, your whakapapa and also about the place that they called home – its land and buildings.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Tūhuratanga",
      subtitle: "discovery",
      level: 3,
      // layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="discovery" bind={this} key={this}><p><a href="">Tūhuratanga | Discovery</a> <span class="italic">level 3</span> <span>Explore the nonfiction collection with thousands of books on a huge range of subjects. Get help with print and online resources for research or recreation. Use the public internet computers or, for those who want a low-key space to read or study, there is a separate room called &lsquo;The Quiet Place&rsquo;. Study, research or browse for some recreational reading.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    }),
    new Floor({
      title: "Auahatanga",
      subtitle: "creativity",
      level: 4,
      // layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Turanga_Spots/FeatureServer",
      content: (<div id="creativity" bind={this} key={this}><p><a href="">Auahatanga | Creativity</a> <span class="italic">level 4</span> <span>Browse the World Languages, Music and Fiction collections, including Biographies and Graphic Novels. Visit the two roof gardens with great views across the city. Explore your creativity in the Production Studio using creative technology such as 3D printers and sewing machines. Create and edit music and video using the Audio/Video Studio, or take a class in the Computer Labs with a great range of software available.</span></p><p>Listen to the name of this floor [MP3]</p></div>)
    })
  ]);

  @property()
  camera = new Camera({"position":{"spatialReference":{"wkid":102100},"x":19217906.056871723,"y":-5392983.203578308,"z":138.30973901506513},"heading":0.000002699869328381916,"tilt":0.4999919670732401});
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570527.3036612223,"y":5180359.178648159,"z":86.69521235276355},"heading":124.3049960081546,"tilt":73.36076191888827});
  // ipad friendlier camera: 
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570670.452701511,"y":5180244.367632804,"z":208.91035901793373},"heading":0,"tilt":0.5000000007083909})
  //{"position":{"spatialReference":{"wkid":2193},"x":1570544.291609822,"y":5180361.938219893,"z":71.53173486068152},"heading":124.30499600935663,"tilt":73.36076191907371});
  //camera = new Camera({"position":{"spatialReference":{"wkid":102100},"x":19217882.83777959,"y":-5393018.66464356,"z":163.67941159475595},"heading":359.9999957311318,"tilt":0.49998993117987317})

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
      watchUtils.on(this, "appState.initialLayers", "change", () => {
        if (this.appState && this.appState.initialLayers.length > 0) {
          this.layer = appUtils.findLayer(this.appState.initialLayers, "Turanga Floor Points") as FeatureLayer;
          this.layer.popupTemplate = new PopupTemplate({
            overwriteActions: true,
            // title: "OK",
            // content: "ok",
            actions: [] as any
          });
          this.layer.popupEnabled = true;
          this.appState.view.map.layers.add(this.layer);
        }
        else {
          this.layer = new FeatureLayer();
        }
        this.legend.layerInfos = [
          {
            layer: this.layer,
            title: "Legend"
          }
        ];
      });
      
      this.legend = new Legend({
        view: this.appState.view,
        layerInfos: [],
        container: domCtr.create("div", null, "floorLegend")
      });

      watchUtils.init(this, "selectedFloor,appState.pageLocation", () => {
        if (typeof this.selectedFloor === 'number' && this.layer) {
          this.floors.getItemAt(this.selectedFloor).activate(this.layer);
          this.layer.visible = (this.appState.pageLocation === "floors");
        }
      });
    });
  }

  onEnter() {
    this.selectedFloor = 0;
    domClass.remove("floorLegend", "hide");
    domClass.add(document.body, "floors");
    this.appState.view.environment.lighting.directShadowsEnabled = false;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = false;
    this.oldDate = this.appState.view.environment.lighting.date;
    this.appState.view.environment.lighting.date = new Date("Thu Aug 01 2019 03:00:00 GMT+0200 (Central European Summer Time)");


    // this.floors.getItemAt(this.selectedFloor).activate(this.floorView, this.legend);
    this.handles.add(this.appState.view.on("click", (event: any) => {
      this.appState.view.hitTest(event)
        .then((response) => {
          const filtered = response.results.filter((result: any) => {
            return result.graphic.layer === this.layer;
          })[0];
          if (filtered) {
            this.appState.view.popup.open({
              features: [filtered.graphic],
              location: filtered.mapPoint
            });
          }
        });
    }), "click");

  }

  onLeave() {
    domClass.add("floorLegend", "hide");
    domClass.remove(document.body, "floors");
    this.handles.remove("click");
    this.appState.view.environment.lighting.directShadowsEnabled = true;
    this.appState.view.environment.lighting.ambientOcclusionEnabled = true;
    this.appState.view.environment.lighting.date = this.oldDate;
  }
}

export = FloorsSection;
