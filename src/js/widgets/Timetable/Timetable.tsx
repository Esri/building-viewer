/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import { tsx, renderable } from "esri/widgets/support/widget";

import Widget = require("esri/widgets/Widget");
import Collection = require("esri/core/Collection");

const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@subclass("widgets/Timetable")
class DayTimetable extends declared(Widget) {
  @property()
  opens: Date;

  @property()
  closes: Date;

  render() {
    const today = new Date();
    if (today.getDay() === this.opens.getDay()) {
      const isOpen = (today.getTime() > this.opens.getTime()) && (today.getTime() < this.closes.getTime());
      const openText = isOpen ? "OPEN NOW" : "CLOSE NOW";
      return (<div class="daytime today">
        <h2>TODAY</h2>
        <div class="schedule">{this.opens.getHours()}:00 - {this.closes.getHours()}:00</div>
        <div class="openstatus">{openText}</div>
      </div>)
    }
    else {
      return (<div class="daytime">
        <h3>{daysName[this.opens.getDay()]}</h3>
        <div class="schedule">{this.opens.getHours()}:00 - {this.closes.getHours()}:00</div>
      </div>)
    }
  }

  constructor(args: any) {
    super(args);
  }
}

@subclass("widgets/Timetable")
class Timetable extends declared(Widget) {
  @property()
  @renderable()
  today = new Date();

  @property()
  dates: Collection<DayTimetable> = new Collection([
    new DayTimetable({
      opens: new Date(2019, 2, 18, 8, 0),
      closes: new Date(2019, 2, 18, 17, 0)
    }),
    new DayTimetable({
      opens: new Date(2019, 2, 19, 8, 0),
      closes: new Date(2019, 2, 19, 17, 0)
    }),
    new DayTimetable({
      opens: new Date(2019, 2, 20, 8, 0),
      closes: new Date(2019, 2, 20, 17, 0)
    }),
    new DayTimetable({
      opens: new Date(2019, 2,  21, 8, 0),
      closes: new Date(2019, 2, 21, 17, 0)
    }),
    new DayTimetable({
      opens: new Date(2019, 2, 22, 8, 0),
      closes: new Date(2019, 2, 22, 17, 0)
    }),
  ]);

  render() {
    const dates = this.dates.map(d => d.render()).toArray();
    return (<div bind={this} key={this} class="timetable">{dates}</div>);
  }
}

export = Timetable;
