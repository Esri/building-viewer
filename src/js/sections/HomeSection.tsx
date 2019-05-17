/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Section = require("./Section");

import AppState = require("../AppState");
import { Timetable } from "../widgets/Timetable/Timetable";
import Viewpoints = require("../widgets/Viewpoints/Viewpoints");
import watchUtils = require("esri/core/watchUtils");
import Handles = require("esri/core/Handles");
import FeatureLayer = require("esri/layers/FeatureLayer");
import appUtils = require("../support/appUtils");
import Collection = require("esri/core/Collection");
import PopupInfo = require("../widgets/Popup/PopupInfo");
import WebScene = require("esri/WebScene");

interface HomeSectionCtorArgs {
  content: (that: HomeSection) => any;
  timetable?: Timetable;
  title?: string;
}

@subclass("sections/HomeSection")
class HomeSection extends declared(Section) {
  @property()
  title = "Overview";

  @property()
  id = "home";

  @property({ constructOnly: true })
  timetable: Timetable;

  @property()
  @renderable()
  private textTitle: string;

  @property()
  appState: AppState;

  @property()
  infoPointsLayer: FeatureLayer;

  private handles = new Handles();

  @property()
  content: (that: this) => any;

  @property({dependsOn: ["appState"], readOnly: true})
  get viewpoints() {
    return new Viewpoints({appState: this.appState});
  }

  render() {

    const timetable = this.timetable ? this.timetable.render() : null;
    const title = this.textTitle ? (<h1>{this.textTitle}</h1>) : null;

    return (<div id={this.id}>
      <div bind={this} key={this}>
        {title}
        {this.content(this)}
      </div>
      <section class="Hours">
        <h2 class="slash-title">Opening hours</h2>
        <div>
          {timetable}
        </div>
      </section>
    </div>);
  }

  paneRight() {
    const viewpoints = this.viewpoints ? this.viewpoints.render() : null;
    return (<div>{viewpoints}</div>);
  }

  constructor(args: HomeSectionCtorArgs) {
    super(args as any);

    watchUtils.whenOnce(this, "appState", () => {
      watchUtils.on(this, "appState.initialLayers", "change", () => {
        if (this.appState && this.appState.initialLayers.length > 0) {
          this.infoPointsLayer = this.appState.initialLayers.find(layer => layer.title.indexOf(appUtils.EXTERNAL_INFOPOINT_LAYER_PREFIX) > -1) as FeatureLayer;
          this.infoPointsLayer.outFields = ["*"];
          this.infoPointsLayer.visible = false;
          this.infoPointsLayer.popupTemplate.overwriteActions = true;
          this.infoPointsLayer.popupTemplate.actions = new Collection();
          this.appState.view.map.layers.add(this.infoPointsLayer);
        }
      });
    });

    // Get the title to display in the text:
    watchUtils.whenOnce(this, "appState.view.map.portalItem.title", () => {
      this.textTitle = (this.appState.view.map as WebScene).portalItem.title;
    });

    watchUtils.init(this, "appState.pageLocation", (l) => {
      if (this.infoPointsLayer) {
        this.infoPointsLayer.visible = false; // l === "home";
      }
    });
  }

  onEnter() {
    this.viewpoints.activeViewpoint = null;
    this.handles.add(this.appState.view.on("click", (event: any) => {
     // the hitTest() checks to see if any graphics in the view
     // intersect the given screen x, y coordinates
     this.appState.view.hitTest(event)
      .then((response) => {
        const filtered = response.results.filter((result: any) => {
          return result.graphic.layer === this.infoPointsLayer;
        })[0];
        if (filtered) {
          this.appState.popupInfo = new PopupInfo({
            image: filtered.graphic.attributes.url,
            credit: filtered.graphic.attributes.title
          })
        }
      });
    }), "click");
  }
  onLeave() {
    this.handles.remove("click");
  }
}

export = HomeSection;
