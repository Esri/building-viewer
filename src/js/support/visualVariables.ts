import SimpleRenderer = require("esri/renderers/SimpleRenderer");

export const renderers = {
  surroundings: {
    //--------------------------------------------------------------------------
    //
    //  Surroundings
    //
    //--------------------------------------------------------------------------

    // This is used when displaying the different pages and
    // when there is no other variables defined
    default: {
      renderer: {
        type: "simple",
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{
            type: "fill",
            material: { color: [100,100,100, 1], colorMixMode: "replace" },
            edges: {
              type: "solid", // autocasts as new SolidEdges3D()
              color: [30, 30, 30, 1]
            }
          }]
        }
      },
      // Opacity when displaying the different pages and
      opacity: 1
    },

    "surroundings": {
      renderer: {
        type: "simple",
        symbol: {
          type: "mesh-3d",
          // castShadows: false,
          symbolLayers: [{
            type: "fill",
            material: { color: [255,255,255, 1], colorMixMode: "tint" },
            edges: {
              type: "solid", // autocasts as new SolidEdges3D()
              color: [30, 30, 30, 1]
            }
          }]
        }
      } as any
    },

    "floors": {
      opacity: 0
    }
  },

  mainBuilding: {
    //--------------------------------------------------------------------------
    //
    //  Building
    //
    //--------------------------------------------------------------------------

    // This is used when displaying the different pages and
    // when there is no other variables defined
    default: {
      renderer: new SimpleRenderer({
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{
            type: "fill",
            material: { color: [255,184,1, 1], colorMixMode: "replace" },
            edges: {
              type: "solid", // autocasts as new SolidEdges3D()
              color: [0, 0, 0, 1]
            }
          }]
        }
      } as any),
      // Opacity when displaying the different pages and
      opacity: 1
    },

    // This is used when displaying the different floors:
    "floors": {
      renderer: new SimpleRenderer({
        symbol: {
          type: "mesh-3d",
          symbolLayers: [{
            type: "fill",
            material: { color: [255,255,255, 1], colorMixMode: "replace" },
            edges: {
              type: "solid", // autocasts as new SolidEdges3D()
              color: [30, 30, 30, 1]
            }
          }]
        }
      } as any)
    },

    "surroundings": {
      renderer: null as any
    }
  }
};

export const definitionExpressions = {
  basic: "BldgLevel IS NULL OR BldgLevel IS NOT NULL AND Category <> 'Generic Models'",
  floor: function (floorNumber: number) {
    return "BldgLevel = " + floorNumber + " AND (Category <> 'Generic Models' OR OBJECTID_1 = 2) AND Category <> 'Walls' AND Category <> 'Roofs'  AND Category <> 'Curtain Wall Mullions' AND Category <> 'Curtain Panels'";
  }
};

