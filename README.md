# Building Viewer

This demonstrates the use of [ArcGIS API 4 for JavaScript](https://developers.arcgis.com/javascript/) and [Building Scene Layers](https://developers.arcgis.com/javascript/latest/api-reference/) in a compelling website.

The application presents the [Turanga library](https://my.christchurchcitylibraries.com/turanga/) in 3D. The visitor can explore the library by navigating around, and then inside, floor by floor, to discover this amazing building.

[Visit the live website here.](https://esri.github.io/building-viewer/dist/)

![The live website](./docs/images/screenshot_1.png)


## Features
* Building exploration - discover the great Turanga library
* Customisation - use this app to display your own building
* Discover the building floor by floor on a 2D visualisation
* Get a broader perspective of the building surroundings

## Instructions

### To get a live copy on your machine

1. Clone the repo and `npm install` dependencies
2. Remove ref to this repo: `rm -rf .git`
3. `npm run build` to compile `src/js/*.ts` and `src/css/*.sccs` files in the same folder and watch for changes
4. `npm run server` launches a webserver.
5. Open your browser and enter the local address `http://localhost:8888/`. You should see now the Building Viewer running.

### To add your own building

1. Create a webscene with a BuildingSceneLayer named `Building
2. Open `src/config.tsx` in your favorite code editor
3. Delete all the content except the two first obscure lines
4. Now you need to define 2 parameters in the config to get started:
    
    The `websceneId` of the webscene you created above
    ```
    export const websceneId = "YOUR WEBSCENE ID HERE";
    ```
    *Note that you may to also export on which portal this webscene resides if different from the ArcGis's portal: `export const portalUrl = "https://your-portal-url.com";`*
    
    The `sections` you'd like to have in your Building Viewer (see documentation about sections). Let's start with only one section, the home page:
    ```typescript
    // first import the section:
    import HomeSection = require("./sections/HomeSection");

    // then export the `sections` parameter:
    export const sections = [
        new HomeSection({})
    ];
    ```

5. Recompile the code and reload the website.

Checkout the documentation in the `docs` folder, and in particular the [quick start guide](./docs/Quickstart.md).

## Requirements

* Notepad or your favorite HTML editor
* `npm` and some knowledge of [Typescript](https://www.typescriptlang.org/)
* Web browser with access to the Internet

## Resources

The following external libraries, APIs, open datasets and specifications were used to make this application:

* [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/)
* [Calcite Web](http://esri.github.io/calcite-web/)
* Turangua's BIM data provided by [Christchurch City Council](https://www.ccc.govt.nz/)
* [Christchurch city model](https://www.linz.govt.nz/news/2014-03/3d-models-released-christchurch-city) provided by [Christchurch City Council](https://www.ccc.govt.nz/)
* [Roboto font](https://fonts.google.com/specimen/Roboto)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2019 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/building-viewer/master/license.txt) file.
