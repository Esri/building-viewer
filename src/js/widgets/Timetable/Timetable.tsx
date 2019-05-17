/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");
import Collection = require("esri/core/Collection");

const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableCtorArgs {
  dates: Collection<DayTimetable>;
}

interface DayTimetableCtorArgs {
  opens: string;
  closes: string;
}

@subclass("widgets/Timetable")
export class DayTimetable extends declared(Widget) {
  @property()
  opens: string;

  @property()
  closes: string;

  @property()
  index = 0;

  @property({dependsOn: ["opens", "index"]})
  @renderable()
  private get openDate() {
    const time = this.opens.split(":").map((aTime) => parseInt(aTime));
    return new Date(2019, 2, 18 + this.index, time[0], time[1]);
  }

  @property({dependsOn: ["closes", "index"]})
  @renderable()
  private get closeDate() {
    const time = this.closes.split(":").map((aTime) => parseInt(aTime));
    return new Date(2019, 2, 18 + this.index, time[0], time[1]);
  }

  render() {
    const today = new Date();
    if (today.getDay() === this.openDate.getDay()) {
      return (<div class="daytime today">
        <h3>Today</h3>
        <div class="schedule">{this.openDate.getHours()}:00 - {this.closeDate.getHours()}:00</div>
      </div>);
    }
    else {
      return (<div class="daytime">
        <h3>{daysName[this.openDate.getDay()]}</h3>
        <div class="schedule">{this.openDate.getHours()}:00 - {this.closeDate.getHours()}:00</div>
      </div>);
    }
  }

  constructor(args: DayTimetableCtorArgs) {
    super(args as any);
  }
}

@subclass("widgets/Timetable")
export class Timetable extends declared(Widget) {
  @property()
  @renderable()
  today = new Date();

  @property()
  @renderable()
  dates: Collection<DayTimetable>;

  render() {
    const dates = this.dates.map(d => d.render()).toArray();
    return (<div bind={this} key={this} class="timetable">{dates}</div>);
  }

  constructor(args: TimetableCtorArgs) {
    super(args as any);

    args.dates.forEach((date, i) => date.index = i);
  }
}
