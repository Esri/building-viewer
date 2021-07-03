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
import AppState from "../../AppState";
import Widget from "esri/widgets/Widget";

@subclass("widgets/Popup")
class Popup extends Widget {
  @property({aliasOf: "appState.popupInfo.active"})
  active: boolean = false;

  @property({aliasOf: "appState.popupInfo.image"})
  image: string;

  @property({aliasOf: "appState.popupInfo.credit"})
  credit: string;

  @property()
  appState: AppState;

  constructor(args: {appState: AppState, container: string}) {
    super(args);
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
