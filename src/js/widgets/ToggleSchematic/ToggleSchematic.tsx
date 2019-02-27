/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");
import Toggle = require("../Toggle/Toggle");
import AppState = require("../../AppState");

@subclass("widgets/ToggleSchematic")
class ToggleSchematic extends declared(Widget) {
  @property({constructOnly: true})
  appState: AppState;

  @property({ aliasOf: "toggle.active"})
  @renderable()
  isSchematic: boolean = true;

  @property()
  toggle = new Toggle();

  @property({readOnly: true, dependsOn: ["appState.pageLocation"]})
  @renderable()
  get isShown() {
    return this.appState.pageLocation === "home";
  }

  constructor(args: any) {
    super(args);

    this.watch("isSchematic", (isSchematic) => {
      this.appState.mode = isSchematic ? "schematic" : "real";
    });

    this.watch("appState.mode", (mode) => {
      this.isSchematic = (mode === "schematic");
    });
  }

  render() {
    const activeIsSchematicClass = {
      "active": this.isSchematic
    };
    const activeIsRealClass = {
      "active": !this.isSchematic
    };
    const showClass = {
      "hide": !this.isShown
    };
    return (<div bind={this} key={this} class={this.classes("toggle-schematic", showClass)}>
      <div class={this.classes("item", activeIsRealClass)} onclick={this.onClickReal.bind(this)}>Real</div>
      {this.toggle.render()}
      <div class={this.classes("item", activeIsSchematicClass)} onclick={this.onClickSchematic.bind(this)}>Schematic</div>
    </div>);
  }

  private onClickSchematic(event: Event) {
    event.stopPropagation();
    this.isSchematic = true;
  }

  private onClickReal(event: Event) {
    event.stopPropagation();
    this.isSchematic = false;
  }
}

export = ToggleSchematic;
