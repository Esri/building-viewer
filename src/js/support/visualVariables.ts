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

// Some useful definitionExpression:
export const definitionExpressions = {
  basic: "BldgLevel IS NULL OR BldgLevel IS NOT NULL",

  // this is used to filter FeatureLayer:
  floor: function (floorNumber: number, extraQuery = " AND Category <> 'Generic Models'") {
    return "BldgLevel = " + floorNumber + extraQuery;
  }
};

export const FLOOR_FILTER_NAME = "BuildingFloor";

export function createFilterFor(floorNumber: number, extraQuery?: string) /*: BuildingFilter*/ {
  return {
    filterBlocks: [
      {
        filterMode: { type: "solid" },
        filterExpression: definitionExpressions.floor(floorNumber, extraQuery),
        title: "floor"
      }
    ],
    name: FLOOR_FILTER_NAME
  };
}
