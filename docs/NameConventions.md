# Naming conventions

## Layers

Besides the required the building scene layer, without which the entire application would not have any sense, there are some layers and their names that have specific meaning. Any other layer you add to the scene will be left untouched and visible at all time in your application.

All the names need to include the following, but you can have longer layer's name, e.g. "Building: Turanga Library".

- `"Building"`: this is the only required layer in your webscene. It needs to be a [Building Scene Layer](https://developers.arcgis.com/javascript/latest/api-reference/)
- `"City model"`: this is an optional layer in your webscene that show the surroundings. It needs to be a [Scene Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SceneLayer.html).
- `"Floor points"`: this layer needs to be a [`FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html) that will be added to the `FloorsSection`. Additionally, if every features have a number attribute `BldgLevel`, the feature filtered depending on the selected floor (See [FloorsSection](./Sections.html)).
- `"Floor pictures"`: this layer needs to be a [`FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html), displaying icons, with the string attributes `url`, `title` and `credit`. It will be added to the `FloorsSection`. When a user cliks on it, a popup is displayed with the information provided through the attributes. Additionally, if every features have a number attribute `BldgLevel`, the feature filtered depending on the selected floor (See [FloorsSection](./Sections.html)).
- `"External pictures"`: this layer needs to be a [`FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html), displaying icons, with the string attributes `url`, `title` and `credit`. It will be added to the `HomeSection`. When a user cliks on it, a popup is displayed with the information provided through the attributes.


### Prefix

- `"Surroundings:"`: Any layer with name starting with this prefix will be added to the `SurroundingsSection` on the left. A toggle allows user to turn them on or off (off by default).


## Slides

Slides with the following names have specific roles:

- `"Overview"`: The slide's camera will be automatically be applied to the view when a user goes to the `HomeSection`
- `"Floor by floor"`: The slide's camera will be automatically be applied to the view when a user goes to the `FloorsSection`
- `"Surroundings"`: The slide's camera will be automatically be applied to the view when a user goes to the `SurroundingsSection`
- In general, a section is looking among the slide's names and any slide matching the section's title will be applied to the view when a user goes to this section

### Prefix

Additionally, this prefix has also a specific meaning:

- `"Points of Interest:"`: this suffix is used by the `SurroundingsSection` to display different interactive point of interests. When a user clicks on any of the point of interests, the camera is applied to the view.
