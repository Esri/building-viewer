/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import AppState = require("../../AppState");
import Widget = require("esri/widgets/Widget");

@subclass("widgets/Popup")
class Popup extends declared(Widget) {
  @property({aliasOf: "appState.popupInfo.active"})
  @renderable()
  active: boolean = false;

  @property({aliasOf: "appState.popupInfo.image"})
  @renderable()
  image: string;

  @property({aliasOf: "appState.popupInfo.credit"})
  credit: string;

  @property()
  appState: AppState;

  constructor(args: any) {
    super(args);

    // this.watch("appState.popupInfo.image", () => {
    //   if (this.appState.popupInfo) {
    //     // this.active = true;
    //     this.image = this.appState.popupInfo.image;
    //     this.credit = this.appState.popupInfo.credit;
    //     // this.scheduleRender();
    //   }
    //   else {
    //     this.active = false;
    //   }
    // });
  }

  render() {
    const activeClass = {
      "active": this.active
    };
    const image = this.image ? (<img src={this.image}/>) : null;
    const credit = this.credit ? (<div class="credit"><div>{this.credit}</div></div>) : null;
    return (<div bind={this} key={this} class={this.classes("popup", activeClass)} onclick={this.onClick.bind(this)}>{image}{credit}</div>);
  }

  private onClick(event: Event) {
    event.stopPropagation();
    this.active = false;
  }
}

export = Popup;
