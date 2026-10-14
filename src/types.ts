export type Cell = { x: number; y: number };
export type Building = {
  id: string;
  name: string;
  englishName: string;
  count: number;
  level: number;
  width: number;
  height: number;
  category: string;
  image: string;
  optional: boolean;
};
export type PlacedBuilding = Building & Cell & { instance: string };
export type Hall = {
  level: number;
  walls: number;
  wallLevel: number;
  wallImage: string | null;
  image: string;
  buildings: Building[];
};
export type GameData = {
  version: number;
  checkedAt: string;
  gridSize: number;
  source: string;
  halls: Hall[];
};
export type PatternId =
  | "trophy"
  | "sword"
  | "skull"
  | "phoenix"
  | "dragon"
  | "lotus"
  | "koi"
  | "butterfly";
export type DesignOptions = {
  mode: "text" | "shape";
  font:
    | "dancing"
    | "allura"
    | "vibes"
    | "lobster"
    | "playfair"
    | "coiny"
    | "caveat";
  flourish: "none" | "swash" | "blade";
  stroke: "light" | "original";
  ornaments: boolean;
  frame: "diagonal" | "grid";
  text: string;
  pattern: PatternId;
  scale: number;
  thickness: number;
  gap: number;
  outline: boolean;
  rotation: number;
  mirrored: boolean;
  offsetX: number;
  offsetY: number;
};
export type Generation = {
  cells: Cell[];
  width: number;
  height: number;
  normalized: string;
  unsupported: string[];
  requiredWalls: number;
  outside: number;
  issue: string | null;
  mainWalls: number;
  ornamentWalls: number;
};
export type Blueprint = {
  version: 1;
  hall: number;
  options: DesignOptions;
  walls: Cell[];
  includeBuildings: boolean;
  includeBob: boolean;
  gameLink: string;
  savedAt?: string;
};
