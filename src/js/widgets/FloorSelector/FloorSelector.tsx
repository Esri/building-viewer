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
import Widget from "esri/widgets/Widget";
import AppState from "../../AppState";


interface FloorSelectorCtorArgs {
  minFloor: number;
  maxFloor: number;
  appState: AppState;
}

interface FloorSelectorCtorArgs2 {
  appState: AppState;
}

@subclass("widgets/FloorSelector")
class FloorSelector extends Widget {
  @property({aliasOf: "appState.floorNumber"})
  activeFloor: number;

  @property()
  maxFloor = 4;

  @property()
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
