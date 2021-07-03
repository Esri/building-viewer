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

import Collection from "esri/core/Collection";
import Section from "./Section";
import AppState from "../AppState";

type SectionSubclass = Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">;

@subclass("sections/Section")
class Sections extends Collection<SectionSubclass> {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  @property()
  set activeSection(sectionToActivate: SectionSubclass) {
    if (sectionToActivate !== this._get("activeSection")) {
      this.previousActiveSection = this.activeSection;

      if (this.previousActiveSection) {
        this.previousActiveSection.onLeave();
      }

      this.forEach(section => {
        if (section !== sectionToActivate) {
          section.active = false;
        }
        else {
          section.active = true;
        }
      });
      this.appState.pageLocation = sectionToActivate ? sectionToActivate.id : null;
      this._set("activeSection", sectionToActivate);

      if (this.activeSection) {
        this.activeSection.onEnter();
      }
    }

    if (this.activeSection.camera) {
      this.emit("go-to", this.activeSection.camera);
    }
  }

  @property({ constructOnly: true})
  private appState: AppState;

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  previousActiveSection: SectionSubclass = null;

  activeSectionNode: HTMLElement = null;
  previousActiveSectionNode: HTMLElement = null;

  //--------------------------------------------------------------------------
  //
  //  Life circle
  //
  //--------------------------------------------------------------------------

  constructor(sections: SectionSubclass[], appState: AppState) {
    super(sections.map((section) => {
      section.appState = appState;
      return section;
    }));

    this.appState = appState;

    this.watch("appState.pageLocation", this.activateSection);
  }

  //--------------------------------------------------------------------------
  //
  //  Public methods
  //
  //--------------------------------------------------------------------------

  activateSection(section: string | number | SectionSubclass) {
    if (section instanceof Section) {
      this.activeSection = section;
    }
    if (typeof section === "string") {
      this.activeSection = this.find((s) => s.id === section);
    }
    if (typeof section === "number") {
      this.activeSection = this.getItemAt(section);
    }
  }

  public paneLeft(firstRendering = true) {
    const panes = this.swapPanes("render", firstRendering);
    return (<div id="pane-left">{panes}</div>);
  }

  public paneRight(firstRendering = true) {
    const panes = this.swapPanes("paneRight", firstRendering);
    return (<div id="pane-right">{panes}</div>);
  }

  public menu() {
    let items = this.map((section, i) => {
      const slash = i !== 0 ? (<span class="slash">/ </span>) : null;
      return [slash, this.renderOneSectionMenu(section, i)];
    });
    return (<div id="menu">{items.toArray()}</div>);
  }

  private renderOneSectionMenu(section: SectionSubclass, i: number) {
    const classes = section.active? "active" : "";
    return (<a class={classes} href="javascript: void(0)" onclick={() => {this.activateSection(section.id);}}>{section.title}</a>);
  }

  private swapPanes(renderViewToCall: string, firstRendering = true) {

    
    const activeSectionClasses = firstRendering ? "pane" : "active pane";
    const previousActiveSectionClasses = firstRendering ? "active pane" : "pane";
    
    const currentPane = this.activeSection ? (<div class={activeSectionClasses} key={this.activeSection}>{this.activeSection[renderViewToCall]()}</div>) : null;
    const previousUsedPane = this.previousActiveSection ? (<div class={previousActiveSectionClasses} key={this.previousActiveSection}>{this.previousActiveSection[renderViewToCall]()}</div>) : null;
    
    return (<div>{previousUsedPane}{currentPane}</div>);
  }
}

export = Sections;
