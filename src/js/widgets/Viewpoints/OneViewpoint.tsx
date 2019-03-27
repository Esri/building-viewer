/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Slide = require("esri/webscene/Slide");
import AppState = require("../../AppState");
import Widget = require("esri/widgets/Widget");

@subclass("widgets/Viewpoints/Viewpoint")
class OneViewpoint extends declared(Widget) {
  @property()
  slide: Slide;

  @property()
  appState: AppState;

  @property()
  @renderable()
  active: boolean = false;

  render() {
    const activeClass = {
      "active": this.active
    };
    return (<li bind={this} key={this} class={this.classes("viewpoint", activeClass)} onclick={this.onClick.bind(this)}>
      {this.slide.title.text}
    </li>);
  }

  constructor(args: any) {
    super(args);
  }

  private onClick() {
    event.stopPropagation();
    this.active = true;
    this.appState.view.goTo(this.slide.viewpoint);
  }
}

export = OneViewpoint;
