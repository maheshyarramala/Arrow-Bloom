/**
 * Additional Arrow Bloom silhouettes (levels 51–150).
 * Each entry is a deterministic geometric variation of a hand-authored base silhouette.
 */
import { SHAPE_DEFINITIONS } from './shapes.ts';

const collectionThemes = ["Deep Sea","Enchanted","Cosmos","Sweet World","Sports","Music","Adventure","Technology","Mythical","Mastery"];
const shapeNames = ["Coral Reef","Sea Turtle","Manta Ray","Seahorse","Jellyfish","Shell","Starfish","Dolphin","Octopus","Submarine","Fairy Wand","Magic Mushroom","Crystal Tower","Fairy Crown","Spell Book","Enchanted Rose","Moon Castle","Pixie Wings","Magic Lantern","Unicorn Horn","Saturn Ring","Comet","Nebula","Rocket","Asteroid","Space Station","Galaxy Spiral","Alien","Solar Flare","Black Hole","Cupcake","Donut","Candy Cane","Ice Cream","Lollipop","Gingerbread","Macaron","Chocolate Bar","Strawberry Tart","Pudding","Soccer Ball","Basketball","Tennis Racket","Trophy","Skateboard","Baseball Cap","Whistle","Boxing Glove","Racing Flag","Medal","Guitar","Piano","Violin","Drum","Music Note","Microphone","Headphones","Saxophone","Harp","Trumpet","Compass","Treasure Chest","Mountain Tent","Sailing Ship","Explorer Hat","Lantern","Backpack","Parachute","Castle Gate","Map","Robot","Game Controller","Microchip","Satellite","Smartphone","Drone","Circuit Board","Headset","Keyboard","Gear","Phoenix","Griffin","Mermaid","Pegasus","Kraken","Wizard Hat","Dragon Egg","Sword","Magic Shield","Crown","Prism","Infinity Knot","Crystal Star","Solar Crown","Eternal Flame","Quantum Cube","Master Key","Crescent Portal","Crown Jewel","Grand Master Bloom"];
const baseShapeIds = Object.keys(SHAPE_DEFINITIONS).map(Number).filter((id) => id >= 1 && id <= 49);

for (let level = 51; level <= 150; level++) {
  const offset = level - 51;
  const collectionId = 6 + Math.floor(offset / 10);
  const shapeIndex = offset % 10;
  const base = SHAPE_DEFINITIONS[baseShapeIds[(offset * 7 + Math.floor(offset / 3)) % baseShapeIds.length]];
  const angle = ((offset % 4) - 1.5) * 0.18;
  const scaleX = 0.82 + ((offset * 3) % 5) * 0.055;
  const scaleY = 0.82 + ((offset * 2 + 1) % 5) * 0.055;
  const mirror = offset % 2 === 1;
  const polygons = base.polygons.map((poly) => poly.map(([x, y]) => {
    const px = (mirror ? 1 - x : x) - 0.5;
    const py = y - 0.5;
    const rx = px * Math.cos(angle) - py * Math.sin(angle);
    const ry = px * Math.sin(angle) + py * Math.cos(angle);
    return [
      Math.max(0.035, Math.min(0.965, 0.5 + rx * scaleX)),
      Math.max(0.035, Math.min(0.965, 0.5 + ry * scaleY)),
    ] as [number, number];
  }));
  const isFinal = level === 150;
  SHAPE_DEFINITIONS[level] = {
    id: isFinal ? 'grand_master' : `level_${level}_${shapeNames[offset].toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: isFinal ? 'Grand Master Bloom' : shapeNames[offset],
    collectionId: collectionId,
    polygons: isFinal ? [[[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]]] : polygons,
    description: `${collectionThemes[collectionId - 6]} silhouette challenge`,
  };
}


const lateCollectionThemes = [
  "Ancient Ruins","Wild Kingdom","Machines","Underworld","Festivals",
  "Arctic","Desert","Inventions","Dreamscape","Guardians",
  "Botanical","Deep Space","Architecture","Elements","Grandmaster",
];
const lateShapeNames = [
  "Obelisk","Temple Arch","Ancient Mask","Sphinx","Stone Tablet","Relic","Pyramid","Amphora","Colosseum","Totem",
  "Wolf","Eagle","Tiger","Elephant","Fox","Owl","Crocodile","Peacock","Stag","Panther",
  "Gear Train","Steam Engine","Crane","Windmill","Turbine","Robot Arm","Locomotive","Bridge","Factory","Clockwork",
  "Crystal Cave","Volcano","Lava Flow","Cave Fish","Stalactite","Meteorite","Fossil","Mushroom Cave","Gem Cluster","Cavern Gate",
  "Fireworks","Drum","Lantern","Mask","Parade Float","Confetti","Kite","Festival Arch","Ribbon","Fire Dancer",
  "Polar Bear","Penguin","Iceberg","Snowflake","Igloo","Seal","Aurora","Sled","Walrus","Glacier",
  "Cactus","Scorpion","Camel","Dune","Oasis","Sandstorm","Desert Rose","Pyramid Gate","Lizard","Sun Dial",
  "Telescope","Printing Press","Camera","Microscope","Satellite Dish","Battery","Light Bulb","Radio","Compass Rose","Periscope",
  "Dream Key","Cloud Castle","Flying Carpet","Dream Catcher","Magic Portal","Hourglass","Crystal Ball","Floating Island","Moon Gate","Wish Star",
  "Lion Guardian","Stone Golem","Dragon","Phoenix Shield","Griffin","Sea Guardian","Pegasus","Warrior Helm","Mythic Spear","Royal Crest",
  "Fern","Lotus","Orchid","Bonsai","Palm Leaf","Vine","Pine Cone","Sunflower","Bamboo","Water Lily",
  "Black Hole","Star Cluster","Space Telescope","Astrolabe","Orbit","Space Shuttle","Lunar Lander","Comet Trail","Nebula Gate","Planet Ring",
  "Lighthouse","Clock Tower","Archway","Pagoda","Castle","Dome","Skyscraper","Aqueduct","Tower Bridge","Grand Hall",
  "Flame","Wave","Mountain","Tornado","Lightning","Raindrop","Earth Globe","Wind Spiral","Ice Crystal","Solar Flare",
  "Master Crown","Infinity Maze","Grand Compass","Final Portal","Master Key","Golden Phoenix","Eternal Tree","Cosmic Bloom","Crown Jewel","Arrow Bloom Crest"
];
const lateBaseIds = Object.keys(SHAPE_DEFINITIONS).map(Number).filter((id) => id >= 1 && id <= 49);
for (let level = 151; level <= 300; level++) {
  const offset = level - 151;
  const worldIndex = Math.floor(offset / 10);
  const shapeIndex = offset % 10;
  const base = SHAPE_DEFINITIONS[lateBaseIds[(offset * 11 + Math.floor(offset / 5)) % lateBaseIds.length]];
  const angle = ((offset % 7) - 3) * 0.095;
  const scaleX = 0.78 + ((offset * 3) % 6) * 0.045;
  const scaleY = 0.78 + ((offset * 5 + 1) % 6) * 0.045;
  const mirror = offset % 2 === 1;
  const polygons = base.polygons.map((poly) => poly.map(([x, y]) => {
    const px = (mirror ? 1 - x : x) - 0.5;
    const py = y - 0.5;
    const rx = px * Math.cos(angle) - py * Math.sin(angle);
    const ry = px * Math.sin(angle) + py * Math.cos(angle);
    return [
      Math.max(0.025, Math.min(0.975, 0.5 + rx * scaleX)),
      Math.max(0.025, Math.min(0.975, 0.5 + ry * scaleY)),
    ] as [number, number];
  }));
  SHAPE_DEFINITIONS[level] = {
    id: `level_${level}_${lateShapeNames[offset].toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name: lateShapeNames[offset],
    collectionId: 16 + worldIndex,
    polygons,
    description: `${lateCollectionThemes[worldIndex]} advanced silhouette challenge`,
  };
}
