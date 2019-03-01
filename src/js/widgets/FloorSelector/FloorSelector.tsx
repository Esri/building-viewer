/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");
import AppState = require("../../AppState");

@subclass("widgets/FloorSelector")
class FloorSelector extends declared(Widget) {
  @property({aliasOf: "appState.floorNumber"})
  @renderable()
  activeFloor: number;

  @property()
  @renderable()
  maxFloor = 5;

  @property()
  @renderable()
  minFloor = 0;

  @property({constructOnly: true})
  appState: AppState;

  render() {
    const levels = Array.from(Array(Math.abs(this.minFloor) + this.maxFloor).keys()).reverse().map((rawLevel: number) => {
      const level: number = rawLevel - this.minFloor;
      const levelText = level === 0 ? "G" : level;
      const activeClass = {
        "active": this.activeFloor === level
      };
      return (<li class={this.classes("level", activeClass)} onclick={() => this.activeLevel(level)}>{levelText}</li>);
    });
    
    return (<div bind={this} key={this} class="floor-selector">
      <h2 class="slash-title">Select floor</h2>
      <ul>{levels}</ul>
    </div>);
  }

  private activeLevel(newLevel: number) {
    event.stopPropagation();
    this.activeFloor = newLevel;
  }

  constructor(args: any) {
    super(args);
  }
}

export = FloorSelector;
