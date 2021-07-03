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
import Collection from "esri/core/Collection";

const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TimetableCtorArgs {
  dates: Collection<DayTimetable>;
}

interface DayTimetableCtorArgs {
  opens: string;
  closes: string;
}

@subclass("widgets/Timetable")
export class DayTimetable extends Widget {
  @property()
  opens: string;

  @property()
  closes: string;

  @property()
  index = 0;

  @property({dependsOn: ["opens", "index"]})
    private get openDate() {
    if (!this.opens) {
      return new Date();
    }

    const time = this.opens.split(":").map((aTime) => parseInt(aTime));
    return new Date(2019, 2, 18 + this.index, time[0], time[1]);
  }

  @property({dependsOn: ["closes", "index"]})
    private get closeDate() {
    if (!this.closes) {
      return new Date();
    }

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
export class Timetable extends Widget {
  @property()
  today = new Date();

  @property()
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
