# General

DO NOT CHANGE OR ADD ANY OTHER FUNCTIONALITY other than what I specify in the prompts

Main code structure:
- index.html: contains the HTML structure (Do not put unnecessary part of html code in the the script part)
- main.ts: contains the TypeScript code (you can create additional TS files if needed)
- config.ts: contains the configuration code (links to data, API keys, descriptions, etc.)
- style.css: contains the CSS code

Keep the functionality of the code clearly separated so it is easy to understand.
Check if there are no warnings or errors in the console. If there are any issues, fix them before reporting completion.
Check if there is no unnecessary code that is a leftover from previous versions/attempts. If there is any, remove it before reporting completion.
Validate the results at the end by comparing the output with the expected results using provided screenshots and integrated browser tools and apply improvements if needed.
In the end, explain which commands I should run next (e.g., install, start), if needed
If any requirement cannot be met exactly, stop and explain before proceeding.

# ArcGIS Maps SDK for JavaScript — project rules

- Use the latest stable version of of ArcGIS Maps SDK for JavaScript via npm with @arcgis/core and @arcgis/map-components. Use only this version and don't mix coding patterns from older versions of the SDK.
- To start from scratch use knowledge from https://developers.arcgis.com/javascript/latest/get-started/#use-arcgiscreate and ask for the needed technology if it was not specified in the prompt.
- Use official docs (https://developers.arcgis.com/javascript/latest/references/), samples (https://developers.arcgis.com/javascript/latest/sample-code/), and showcases (https://developers.arcgis.com/javascript/latest/showcase/) as references for the ArcGIS Maps SDK for JavaScript.
- The UI uses map components such as <arcgis-map>, slots (for placing in the map), and reference-element (if it is created outside the arcgis-map/scene element). Do not add @arcgis/core/widgets imports or view.ui.add calls. When migrating from widgets to components, make sure also to style them in the way that they look or act like before (for example adjust background color, or line color or which unit use to display and place them in the same part of the screen), if it is not done by default (ask for input if you think it is not possible)
- Run the documented build, test, or type-check command after each change before you report completion.

# Security and secrets

- Delete auth section created with the template if the app doesn't use it.
- Browser API keys are public client values. Limit each key to required services, privileges, and allowed referrers. Never print or commit values.
- Build-time environment variables keep values out of Git, but browser builds can still bundle client values. They are not a secret store.
- Keep OAuth client secrets, app credentials, and confidential server tokens out of browser code, assistant context, logs, and commits.
