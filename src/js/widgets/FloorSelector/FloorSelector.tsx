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
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");
import AppState = require("../../AppState");


interface FloorSelectorCtorArgs {
  minFloor: number;
  maxFloor: number;
  appState: AppState;
}

interface FloorSelectorCtorArgs2 {
  appState: AppState;
}

@subclass("widgets/FloorSelector")
class FloorSelector extends declared(Widget) {
  @property({aliasOf: "appState.floorNumber"})
  @renderable()
  activeFloor: number;

  @property()
  @renderable()
  maxFloor = 4;

  @property()
  @renderable()
  minFloor = 0;

  @property({constructOnly: true})
  appState: AppState;

  render() {
    const levels = Array.from(Array(Math.abs(this.minFloor) + this.maxFloor + 1).keys()).reverse().map((rawLevel: number) => {
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

  constructor(args: FloorSelectorCtorArgs | FloorSelectorCtorArgs2) {
    super(args as any);
  }
}

export = FloorSelector;
