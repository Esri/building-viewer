/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx } from "esri/widgets/support/widget";

import Collection = require("esri/core/Collection");
import Section = require("./Section");
import AppState = require("../AppState");

type SectionSubclass = Pick<Section, "render" | "active" | "id" | "paneRight" | "title" | "camera" | "onLeave" | "onEnter" | "appState">;

@subclass("sections/Section")
class Sections extends declared(Collection)<SectionSubclass> {
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

  constructor(args: SectionSubclass[], appState: AppState) {
    super(args.map(arg => {
      arg.appState = appState;
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
