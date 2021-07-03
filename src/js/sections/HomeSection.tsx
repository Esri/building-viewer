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
import { Timetable } from "../widgets/Timetable/Timetable";
import Viewpoints from "../widgets/Viewpoints/Viewpoints";
import * as watchUtils from "esri/core/watchUtils";
import Handles from "esri/core/Handles";
import FeatureLayer from "esri/layers/FeatureLayer";
import * as appUtils from "../support/appUtils";
import Collection from "esri/core/Collection";
import PopupInfo from "../widgets/Popup/PopupInfo";
import WebScene from "esri/WebScene";

interface HomeSectionCtorArgs {
  content?: (that: HomeSection) => any;
  timetable?: Timetable;
  title?: string;
  showExternalPoints?: boolean;
}

@subclass("sections/HomeSection")
class HomeSection extends Section {
  @property()
  title = "Overview";

  @property()
  id = "home";

  @property({ constructOnly: true })
  timetable: Timetable;

  @property()
  private textTitle: string;

  @property()
  appState: AppState;

  @property()
  infoPointsLayer: FeatureLayer;

  @property({ constructOnly: true })
  showExternalPoints: boolean = false;

  private handles = new Handles();

  @property()
  content: (that: this) => any = (that: this) => (this.appState.view.map as WebScene).portalItem.snippet;

  @property({dependsOn: ["appState"], readOnly: true})
  get viewpoints() {
    return new Viewpoints({appState: this.appState});
  }

  render() {
    const timetable = this.timetable ? (<section class="Hours">
        <h2 class="slash-title">Opening hours</h2>
        <div>
          {this.timetable.render()}
        </div>
      </section>) : null;
    const title = this.textTitle ? (<h1>{this.textTitle}</h1>) : null;

    return (<div id={this.id}>
      <div bind={this} key={this}>
        {title}
        {this.content(this)}
      </div>
      {timetable}
    </div>);
  }

  paneRight() {
    const viewpoints = this.viewpoints ? this.viewpoints.render() : null;
    return (<div>{viewpoints}</div>);
  }

  constructor(args: HomeSectionCtorArgs) {
    super(args as any);
  }

  postInitialize() {
    // Optionally add the external info points to display pictures:
    watchUtils.whenOnce(this, "appState", () => {
      watchUtils.on(this, "appState.view.map.layers", "change", () => {
        if (this.appState && this.appState.view.map.layers.length > 0) {
          this.infoPointsLayer = this.appState.view.map.layers.find(layer => layer.title.indexOf(appUtils.EXTERNAL_INFOPOINT_LAYER_PREFIX) > -1) as FeatureLayer;

          if (this.infoPointsLayer) {
            this.infoPointsLayer.visible = false;
            this.infoPointsLayer.outFields = ["*"];
            this.infoPointsLayer.visible = false;
            this.infoPointsLayer.popupTemplate.overwriteActions = true;
            this.infoPointsLayer.popupTemplate.actions = new Collection();
          }
        }
      });
    });

    // Get the title to display in the text:
    watchUtils.whenOnce(this, "appState.view.map.portalItem.title", () => {
      this.textTitle = (this.appState.view.map as WebScene).portalItem.title;
    });

    // Enabling external point if we are in the home section:
    watchUtils.init(this, "appState.pageLocation", (l) => {
      if (this.infoPointsLayer) {
        this.infoPointsLayer.visible = this.showExternalPoints && l === "home";
      }
    });
  }

  onEnter() {
    // reset the active viewpoint each time we go in home section:
    this.viewpoints.activeViewpoint = null;

    // check if we click on an external point and display a popup if that is the case:
    this.handles.add(this.appState.view.on("click", (event: any) => {
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
    // when not in home, remove the click listener:
    this.handles.remove("click");
  }
}

export = HomeSection;
