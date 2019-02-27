/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");

@subclass("widgets/Toggle")
class Toggle extends declared(Widget) {
  @property()
  @renderable()
  active: boolean = false;

  render() {
    const activeClass = {
      "active": this.active
    };
    const knob = (<div class={this.classes("knob")}></div>);
    return (<div bind={this} key={this} class={this.classes("toggle", activeClass)} onclick={this.onClick.bind(this)}>{knob}</div>);
  }

  private onClick(event: Event) {
    event.stopPropagation();
    this.active = (!this.active);
  }
}

export = Toggle;
