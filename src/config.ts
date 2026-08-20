export const PORTAL_URL = "https://zurich.maps.arcgis.com";
export const WEB_SCENE_ID = "543648a92446497db8a92c06ce1ad0b1";

export const SECTION_TITLES = {
  overview: "Overview",
  floors: "Floor by floor",
  surroundings: "Surroundings",
} as const;

export type SectionId = keyof typeof SECTION_TITLES;

export interface FloorConfig {
  title: string;
  subtitle: string;
  description: string;
  audioUrl: string;
  buildingLevel: number;
}

export const FLOORS: Record<number, FloorConfig> = {
  0: {
    title: "He Hononga",
    subtitle: "connection",
    description:
      "Open an hour earlier than the rest of the building on weekdays, He Hononga | Connection, Ground Level is the place to return library items, collect holds, browse magazines, DVDs and new arrivals, visit the café or interact with the Discovery Wall.",
    audioUrl: `${import.meta.env.BASE_URL}audio/He-Hononga.mp3`,
    buildingLevel: 1,
  },
  1: {
    title: "Hapori",
    subtitle: "community",
    description:
      "It offers experiences geared towards a wide cross-section of our community. Grab a hot drink at the espresso bar, attend an event in our community arena, or help the kids explore the play and craft areas and children’s resources. It’s also a great place for young adults to hang out, play videogames, try out VR or get some study done.",
    audioUrl: `${import.meta.env.BASE_URL}audio/Hapori.mp3`,
    buildingLevel: 2,
  },
  2: {
    title: "Tuakiri",
    subtitle: "identity",
    description:
      "Find resources and services to help you develop your knowledge about your own identity, your ancestors, your whakapapa and also about the place that they called home - its land and buildings.",
    audioUrl: `${import.meta.env.BASE_URL}audio/Tuakiri.mp3`,
    buildingLevel: 4,
  },
  3: {
    title: "Tūhuratanga",
    subtitle: "discovery",
    description:
      "Explore the nonfiction collection with thousands of books on a huge range of subjects. Get help with print and online resources for research or recreation. Use the public internet computers or, for those who want a low-key space to read or study, there is a separate room called ‘The Quiet Place’. Study, research or browse for some recreational reading.",
    audioUrl: `${import.meta.env.BASE_URL}audio/Tuhuratanga.mp3`,
    buildingLevel: 5,
  },
  4: {
    title: "Auahatanga",
    subtitle: "creativity",
    description:
      "Browse the World Languages, Music and Fiction collections, including Biographies and Graphic Novels. Visit the two roof gardens with great views across the city. Explore your creativity in the Production Studio using creative technology such as 3D printers and sewing machines. Create and edit music and video using the Audio/Video Studio, or take a class in the Computer Labs with a great range of software available.",
    audioUrl: `${import.meta.env.BASE_URL}audio/Auahatanga.mp3`,
    buildingLevel: 6,
  },
};

export const FLOOR_ORDER = [4, 3, 2, 1, 0] as const;

export const OVERVIEW_DESCRIPTION =
  "Tūranga is a library in Central Christchurch and the main library of Christchurch City Libraries, New Zealand. It is the largest library in the South Island and the third-biggest in New Zealand. The previous Christchurch Central Library opened in 1982 on the corner of Oxford Terrace and Gloucester Street but was closed after the February 2011 Christchurch earthquake and demolished in 2014 to make way for the Convention Centre Precinct.";

export const HOURS = [
  ["Monday", "8:00 - 20:00"],
  ["Tuesday", "8:00 - 20:00"],
  ["Wednesday", "8:00 - 20:00"],
  ["Thursday", "8:00 - 20:00"],
  ["Friday", "8:00 - 20:00"],
  ["Saturday", "10:00 - 17:00"],
  ["Sunday", "10:00 - 17:00"],
] as const;

export const LAYER_TITLES = {
  building: "Building: Turanga Library",
  city: "City Model: Christchurch",
  carParks: "Surroundings: Car Parks",
  transportation: "Surroundings: Transportation",
  floorPoints: "Floor points",
  floorPictures: "Floor pictures",
} as const;

export const FLOOR_FILTER_NAME = "BuildingFloor";

export const floorFilterExpression = (buildingLevel: number): string =>
  `BldgLevel = ${buildingLevel} AND (Category <> 'Generic Models' OR OBJECTID_1 = 2) AND Category <> 'Walls' AND Category <> 'Roofs' AND Category <> 'Curtain Wall Mullions' AND Category <> 'Curtain Panels'`;
