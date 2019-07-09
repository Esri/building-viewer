# Sections

The demo uses 3 different sections, the home section, the floor section and the surroundings section. In the following content, we will go through the initialisation of the different sections and explore how you can create new sections.

## General section parameters

- Every section has a configurable `title` which is then the word appearing in the menu.
- To configure the camera of any section, you can add a slide with the coresponding home's title as the name of the slides.

## Home section

The home section ships with 3 main part: 

- The **description of the building** on the left. By default, the description is taken from the scene's description. As shown in the `Quickstart` guide, you can add your text in the `Properties` pane of the Scene Viewer. However, if you'd like to add more complex content, e.g. involving html or somejavacsript logic, you can always pass a parameter `content` to the `HomeSection` constructor. This parameter is a function that takes in argument the section and return some `VNodes` that will be later added to the left. You are now totally free to design the exact content you would like.
- The **viewpoints**: every slides that you create in your webscene with automatically be added as a viewpoints on the right of the HomeSection if the slide's name is not part of the [reserved names](./NamingConvention.md).
- The **building opening hours**: you can pass to your Building Viewer a list of opening hours as follow:
```typescript
new HomeSection({
     timetable: new Timetable({
         dates: new Collection([
           new DayTimetable({
             opens: "8:00",
             closes: "20:00"
           }),
           new DayTimetable({
             opens: "8:00",
             closes: "20:00"
           }),
           new DayTimetable({
             opens: "8:00",
             closes: "20:00"
           }),
           new DayTimetable({
             opens: "8:00",
             closes: "20:00"
           }),
           new DayTimetable({
             opens: "8:00",
             closes: "20:00"
           }),
           new DayTimetable({
             opens: "10:00",
             closes: "17:00"
           }),
           new DayTimetable({
             opens: "10:00",
             closes: "17:00"
           })
         ])
      })
   })
```

## Floor section

The floor section will display a floor picker on the right that allows the user to discover the different level's of the building. There is two way to initialise the floor section. You can either pass the lowest floor number and the hightest floor number as follow:

```typescript
new FloorsSection({
    minFloor: 0,
    maxFloor: 2
})
```

which will allow the user to go through floors 0 to 2. Or you can pass every floor with the content it needs to display on the left of the building when a user select one:

```typescript
new FloorsSection({
    floors: new Collection([
        ...,
        new Floor({
            title: "The name of the floor",
            subtitle: "A subtitle",
            floor: 0,
            content: () => (<div>Some html content</div>)
        }),
        ...
    ])
})
```

This uses [TSX](https://www.typescriptlang.org/docs/handbook/jsx.html) to render the content. Be sure to include the `tsx` function [from the ArcGIS for Javascript API](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-support-widget.html#tsx) to compile this code.


## Surroundings section


The surroundings section display toggles for extra layers you can setup in your webscene or point of view for different building in your surrounding layer, using your webscene's slides (See [naming concention](./NamingConvention.md)).

It does not take any parameter to be initialised: 

```typescript
new SurroundingsSection({})
```

- To add toggle for extra layers, just add `"Surroundings:"` in front of their layer's name in your webscene.
- To add toggle for point of view of building in your "surroundings" layer, just add slides with `"Points of Interest:"` in their title. 


## Create your own section

The building viewer as been designed so that you can easily extend it. Every section share a common base class `Section` which defines the minimal structure for it to be displayed. If you want to create your own section, you can simple extend this class and define the `title`, give it a unique `id` and define what goes on the right side by delcaring `, and what goes on the left by define `render`. 

As an example:

```
@subclass()
class MySection extends declared(Section) {
    @property()
    title = "My section"

    @property()
    id = "my-section"

    render() {
        return (<div></div>);
    }

    paneRight() {
        return (<div></div>);
    }
```

You can of course create a complex widget here. This is following the ArcGIS for Javascript API's [widget convention and structure](https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Widget.html). Be sure to check their [guide first](https://developers.arcgis.com/javascript/latest/guide/custom-widget/index.html).
