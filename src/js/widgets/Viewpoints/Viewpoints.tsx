/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Slide = require("esri/webscene/Slide");
import AppState = require("../../AppState");
import Widget = require("esri/widgets/Widget");
import WebScene = require("esri/WebScene");
import Collection = require("esri/core/Collection");

@subclass()
class OneViewpoint extends declared(Widget) {
  @property()
  slide: Slide;

  @property()
  appState: AppState;

  render() {
    const activeClass = {
      "active": false
    };
    return (<li bind={this} key={this} class={this.classes("viewpoint", activeClass)} onclick={this.onClick.bind(this)}>
      {/*<span class="magnifier-icon"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" class="svg-inline--fa fa-search fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg></span>
      <a href="javascript: void(0)" onclick={this.onClick.bind(this)}>{this.slide.title.text}</a>*/}
      {this.slide.title.text}
    </li>);
  }

  constructor(args: any) {
    super(args);
  }

  private onClick() {
    event.stopPropagation();
    this.appState.view.goTo(this.slide.viewpoint);
  }
}

@subclass("widgets/Viewpoints")
class Viewpoints extends declared(Widget) {
  @property()
  appState: AppState;

  @property({readOnly: true, dependsOn: ["appState.view.map.presentation.slides"]})
  @renderable()
  get slides() {
    return this.appState ? 
      (this.appState.view.map as WebScene).presentation.slides
        .filter((s) => [
          "Building",
          "Entrance",
          "Terrace",
          "Terrace view",
          "Glass facade"
        ].indexOf(s.title.text) > -1 ) 
        .map((s) => new OneViewpoint({slide: s, appState: this.appState})) 
      : new Collection();
  }

  constructor(args: any) {
    super(args);
  }

  render() {
    const items = this.slides.map((s) => s.render()).toArray();
    return (<div bind={this} key={this} class="viewpoints">
      <h2 class="slash-title">Select 3D view</h2>
      <ul>
        {items}
      </ul>
    </div>);
  }
}

export = Viewpoints;
