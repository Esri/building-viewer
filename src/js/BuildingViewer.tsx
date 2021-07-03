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

// esri
import Sections from "./sections/Sections";
import SceneView from "esri/views/SceneView";
import Widget from "esri/widgets/Widget";
import * as promiseUtils from "esri/core/promiseUtils";
import Camera from "esri/Camera";
import SceneLayer from "esri/layers/SceneLayer";
import BuildingSceneLayer from "esri/layers/BuildingSceneLayer";
import WebScene from "esri/WebScene";

// BuildingViewer
import Section from "./sections/Section";
import BuildingVisualisation from "./support/BuildingVisualisation";
import SurroundingsVisualisation from "./support/SurroundingsVisualisation";
import AppState from "./AppState";
import * as appUtils from "./support/appUtils";
import Popup from "./widgets/Popup/Popup";

type SectionSublcass = Pick<Section, "camera">;

interface BuildingViewerCtorArgs {
  sections: Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">[];
  mapContainer: string;
  websceneId: string;
  portalUrl?: string;
  floorMapping?: (originalFloor: number) => number;
  extraQuery?: string;
}

@subclass("webSceneViewer.widgets.LayersLoading.LayersLoadingProgressBar")
class BuildingViewer extends Widget {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property({ aliasOf: "appState.view"})
  view: SceneView;

  @property({ aliasOf: "sections.activeSection"})
  activeSection: SectionSublcass | string | number;

  @property()
  sections: Sections;

  @property()
  appState = new AppState();

  @property()
  websceneId: string;

  @property()
  extraQuery: string;

  @property()
  portalUrl: string;

  //--------------------------------------------------------------------------
  //
  //  Variables:
  //
  //--------------------------------------------------------------------------

  @property({ aliasOf: "appState.buildingLayer"})
  buildingLayer: BuildingVisualisation;

  @property({ aliasOf: "appState.surroundingsLayer"})
  surroundingsLayer: SurroundingsVisualisation;

  private firstRendering: boolean = true;

  private rawSections: Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">[];

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------

  constructor(args: BuildingViewerCtorArgs) {
    super(args as any);

    this.view = appUtils.createViewFromWebScene({websceneId: args.websceneId, mapContainer: args.mapContainer, portalUrl: args.portalUrl});

    if (args.floorMapping) {
      this.floorMapping = args.floorMapping.bind(this);
    }
  }

  normalizeCtorArgs(args: BuildingViewerCtorArgs) {
    this.rawSections = args.sections;
    delete args["sections"];

    return args;
  }

  initialize() {
    this.sections = new Sections(this.rawSections, this.appState);

    (this.view.map as WebScene).when(() => {
      // Save the initial layers:
      promiseUtils
        .eachAlways(this.view.map.layers.map((l) => this.appState.view.whenLayerView(l)))
        .then(() => {

          ///////////////////////////////////
          // Main building to present:
          const BSL = this.appState.view.map.layers.find(layer => layer.title.indexOf(appUtils.MAIN_LAYER_PREFIX) > -1);
          
          if (!BSL) {
            throw new Error("Cannot find the main BuildingSceneLayer (" + appUtils.MAIN_LAYER_PREFIX + ") in the webscene " + this.websceneId);
          }

          const visualisationArgs: any = {
            appState: this.appState,
            layer: BSL as BuildingSceneLayer
          };

          if (this.floorMapping) {
            visualisationArgs.floorMapping = this.floorMapping;
          }

          if (this.extraQuery) {
            visualisationArgs.extraQuery = this.extraQuery;
          }
          
          this.buildingLayer = new BuildingVisualisation(visualisationArgs);

          ///////////////////////////////////
          // Optional surrounding's layer:
          const surroundingsLayer = this.appState.view.map.layers.find(layer => layer.title.toLowerCase().indexOf(appUtils.CITY_LAYER_PREFIX.toLowerCase()) > -1) as SceneLayer;
          if (surroundingsLayer) {
            this.surroundingsLayer = new SurroundingsVisualisation({
              layer: surroundingsLayer,
              appState: this.appState
            });
          }
        });
      
      ///////////////////////////////////
      // Setup camera:
      this.sections.forEach((section) => {
        const slide = (this.view.map as WebScene).presentation.slides.find((slide) => slide.title.text === section.title);
        if (slide) {
          section.camera = slide.viewpoint.camera;
          (this.view.map as WebScene).presentation.slides.remove(slide);
        }
        else {
          console.error("Could not find a slide for section " + section.title);
        }
      });
    });

    this.view.when(() => {
      // Debug:
      window["view"] = this.view;
      window["appState"] = this.appState;

      // Active first section:
      if (this.sections.length > 0) {
        this.sections.activateSection(this.sections.getItemAt(0).id);
      }
    });

    this.watch("activeSection", (activeSection) => {
      this.firstRendering = true;
      this.renderNow();

      setTimeout(() => {
        this.firstRendering = false;
        this.renderNow();
      }, 10)
    });
  }

  render() {
    return (<div>
      <div class="left side-container">{this.sections.paneLeft(this.firstRendering)}</div>
      <div class="left menu">{this.sections.menu()}</div>
      <div class="right side-container">{this.sections.paneRight(this.firstRendering)}</div>
    </div>);
  }

  postInitialize() {

    this.own(this.sections.on("go-to", (camera: Camera) => {
      this.view.goTo(camera);
    }));

    new Popup({ appState: this.appState, container: "popup"});
  }

  floorMapping(num: number) { return num; }
}

export = BuildingViewer;
