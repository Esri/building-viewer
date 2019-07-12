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

import Camera = require("esri/Camera");
import Widget = require("esri/widgets/Widget");

import AppState = require("../AppState");

@subclass("sections/Section")
abstract class Section extends declared(Widget) {
  @property()
  appState: AppState;

  @property()
  abstract title: string;

  @property()
  abstract id: string;

  @property()
  camera: Camera;

  @property()
  active: boolean = false;

  abstract render(): JSX.Element;

  abstract paneRight(): JSX.Element;

  onEnter() {}

  onLeave() {}

  postInitialize() {
    this.own(this.watch("camera", camera => {
      if (camera) {
        this.emit("go-to", camera);
      }
    }));
  }
}

export = Section;
