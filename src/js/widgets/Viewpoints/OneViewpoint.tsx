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
import Slide from "esri/webscene/Slide";
import AppState from "../../AppState";
import Widget from "esri/widgets/Widget";

@subclass("widgets/Viewpoints/Viewpoint")
class OneViewpoint extends Widget {
  @property()
  slide: Slide;

  @property()
  appState: AppState;

  @property()
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
