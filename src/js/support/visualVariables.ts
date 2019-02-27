import SimpleRenderer = require("esri/renderers/SimpleRenderer");
import Color = require("esri/Color");

export const backgroundColor = new Color([70,70,70, 1]);

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
          // castShadows: false,
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

    // This is when schematic is on
    schematic: {},

    // this is when real is on
    real: {},
    // This is used when displaying the different floors:
    "schematic-surroundings": {
      opacity: 1
    },
    "real-surroundings": {
      renderer: null as any
    },
    "real-floors": {
      opacity: 0
    },
    "schematic-floors": {
      opacity: 0
    }
  },

  mainBuilding: {
    //--------------------------------------------------------------------------
    //
    //  Surroundings
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

    // This is when schematic is on
    schematic: {},

    // this is when real is on
    real: {
      renderer: null as any
    },
    // This is used when displaying the different floors:
    floors: {
      opacity: 0
    },
    "schematic-surroundings": {
      renderer: new SimpleRenderer({
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
      } as any)
    },
    "real-surroundings": {
      renderer: null as any
    }
  },

  secondaryBuilding: {
    //--------------------------------------------------------------------------
    //
    //  secondary building
    //
    //--------------------------------------------------------------------------

    // This is used when displaying the different pages and
    // when there is no other variables defined
    default: {
      renderer: null as any,
      // Opacity when displaying the different pages and
      opacity: 0
    }
  }
}

export const definitionExpressions = {
  basic: "BldgLevel IS NULL OR BldgLevel IS NOT NULL AND Category <> 'Generic Models'",
  floor: function (floorNumber: number) {
    return "BldgLevel = " + floorNumber + " AND Category <> 'Generic Models' AND Category <> 'Walls' AND Category <> 'Roofs'  AND Category <> 'Curtain Wall Mullions' AND Category <> 'Curtain Panels'";
  },
  belowFloor: function (floorNumber: number) {
    return "BldgLevel < " + floorNumber + " AND Category <> 'Generic Models' AND Category <> 'Walls' AND Category <> 'Roofs'  AND Category <> 'Curtain Wall Mullions' AND Category <> 'Curtain Panels'";
  }
};

