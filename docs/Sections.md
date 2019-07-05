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



## Surroundings section

## Create your own section
