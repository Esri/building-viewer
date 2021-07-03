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

@subclass("widgets/Toggle")
class Toggle extends Widget {
  @property()
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
