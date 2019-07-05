# Building Viewer

This demonstrates the use of [ArcGIS API 4 for JavaScript](https://developers.arcgis.com/javascript/) and [Building Scene Layers](https://developers.arcgis.com/javascript/latest/api-reference/) in a compelling website.

The application presents the [Turanga library](https://my.christchurchcitylibraries.com/turanga/) in 3D. The visitor can explore the library by navigating around, and then inside, floor by floor, to discover this amazing building.

[Visit the live website here.](https://yannikmesserli.github.io/esri-building-viewer/dist/)

## To get a live copy on your machine

1. Clone the repo and `npm install` dependencies
2. Remove ref to this repo: `rm -rf .git`
3. `npm run build` to compile `src/js/*.ts` and `src/css/*.sccs` files in the same folder and watch for changes
4. `npm run serve` launches a webserver and then you can access the `index.html` in your favorite browser.

## To add your own building

1. Open `src/config.tsx` in your favorite code editor
2. Delete all the content except the two first obscure lines
3. Now you need to define 2 parameters in the config to get started:
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

4. Recompile the code and reload the website.

Checkout the documentation in the `docs` folder.
