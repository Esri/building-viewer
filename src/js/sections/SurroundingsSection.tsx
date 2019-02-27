/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Section = require("./Section");
import AppState = require("../AppState");
import Collection = require("esri/core/Collection");
import Camera = require("esri/Camera");
import Widget = require("esri/widgets/Widget");
import Toggle = require("../widgets/Toggle/Toggle");
import watchUtils = require("esri/core/watchUtils");
import UniqueValueRenderer = require("esri/renderers/UniqueValueRenderer");

import FeatureLayer = require("esri/layers/FeatureLayer");

@subclass()
class SurroundingsElement extends declared(Widget) {
  @property()
  toggle = new Toggle();

  @property({aliasOf: "toggle.active"})
  @renderable()
  set active(isActive: boolean) {
    this.toggle.active = isActive;
  }
  get active() {
    return this.toggle.active;
  }

  @property()
  title: string;

  @property()
  layer: FeatureLayer;

  @property()
  appState: AppState;

  activate() {
    this.appState.view.map.layers.add(this.layer);
    watchUtils.whenOnce(this, "layer.renderer", () => {
      console.log("ok");
      const r = (this.layer.renderer as any).clone();
      r.symbol.height = 30;
      r.symbol.width = 30;
      r.symbol.verticalOffset = {
        screenLength: 40,
        maxWorldLength: 100,
        minWorldLength: 20
      };
      r.symbol.callout = {
        type: "line", // autocasts as new LineCallout3D()
        size: 1.5,
        color: "white",
        border: {
          color: "black"
        }
      };
      this.layer.renderer = r;
    });
  }

  deactivate() {
    this.appState.view.map.layers.remove(this.layer);
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

    if (args.activate) {
      this.activate = args.activate.bind(this);
    }
    if (args.deactivate) {
      this.deactivate = args.deactivate.bind(this);
    }
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


  normalizeCtorArgs(args: any) {
    const data: any = {
      url: args.layer
    };
    if (args.renderer) {
      data.renderer = args.renderer;
    }
    args.layer = new FeatureLayer(data);
    args;
  }

  customRendererBuilder() {
    const defaultSymbol = this.appState.mode === "schematic" ? {
      type: "mesh-3d",  // autocasts as new MeshSymbol3D()
      symbolLayers: [{
        type: "fill",  // autocasts as new FillSymbol3DLayer()
        material: { color: [100,100,100, 1], colorMixMode: "replace" },
        edges: {
          type: "solid", // autocasts as new SolidEdges3D()
          color: [30, 30, 30, 1]
        }
      }]
    } as any : null;
    this.appState.surroundingsLayer.customRenderer = new UniqueValueRenderer({
      field: "OBJECTID",
      defaultSymbol: defaultSymbol,
      uniqueValueInfos: ["1770", "1785", "2424", "1776", "2423"].map((id) => {
        return {
          // All features with value of "North" will be blue
          value: id,
          symbol: {
            type: "mesh-3d",  // autocasts as new MeshSymbol3D()
            symbolLayers: [{
              type: "fill",  // autocasts as new FillSymbol3DLayer()
              material: { color: [0,251,133, 1], colorMixMode: "replace" },
              edges: {
                type: "solid", // autocasts as new SolidEdges3D()
                color: [30, 30, 30, 1]
              }
            }]
          } as any
        };
      })
    });
  }
}

@subclass("sections/SurroundingsSection")
class SurroundingsSection extends declared(Section) {
  @property()
  title = "Surroundings";

  @property()
  appState: AppState;

  @property()
  id = "surroundings";

  elements: Collection<SurroundingsElement> = new Collection([
    new SurroundingsElement({
      title: "Bus stop",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Bus_Stops_Christchurch/FeatureServer",
    }),
    new SurroundingsElement({
      title: "Car parks",
      layer: "https://servicesdev.arcgis.com/5xC5Wrapp1gUAl2r/arcgis/rest/services/Car_Parks/FeatureServer"
    }),
    new SurroundingsElement({
      title: "Points of Interest",
      activate: function() {
        watchUtils.init(this, "appState.mode", (mode) => {
          if (this.active) {
            this.customRendererBuilder()
          }
        });
      },
      deactivate: () => {
        this.appState.surroundingsLayer.customRenderer = null;
      },
      content: () => {
        return (<div class="content">
          <div><span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span><a href="javascript: void(0)" onclick={() => this.appState.view.goTo(new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570574.1309082045,"y":5180230.848900111,"z":55.408850426578724},"heading":124.30499600917526,"tilt":73.3607619189153}))}>Heritage Christchurch</a></div>
          <div><span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span><a href="javascript: void(0)" onclick="">Isaac Theatre Royal</a></div>
          <div><span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span><a href="javascript: void(0)" onclick="">ChristChurch Cathedral</a></div>
          <div><span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span><a href="javascript: void(0)" onclick="">The Piano Center</a></div>
        </div>);
      }
    })
  ]);

  constructor(args: any) {
    super(args);

    watchUtils.whenOnce(this, "appState", () => {
      this.elements.forEach(el => el.appState = this.appState)
    });
  }

  @property()
  // camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570527.3036612223,"y":5180359.178648159,"z":86.69521235276355},"heading":124.3049960081546,"tilt":73.36076191888827});
  // ipad friendlier camera: 
  camera = new Camera({"position":{"spatialReference":{"wkid":2193},"x":1570168.9825217058,"y":5180616.06923099,"z":206.98993367619465},"heading":124.30499600866226,"tilt":73.36076191887102});

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
    this.elements.getItemAt(2).active = true;
  }

  onLeave() {
    this.elements.forEach(e => e.active = false);
  }
}

export = SurroundingsSection;
