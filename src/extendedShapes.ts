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
    name: `${collectionThemes[collectionId - 6]} ${isFinal ? 'Grand Master Bloom' : shapeNames[offset]}`,
    collectionId: collectionId,
    polygons: isFinal ? [[[0.05, 0.05], [0.95, 0.05], [0.95, 0.95], [0.05, 0.95]]] : polygons,
    description: `${collectionThemes[collectionId - 6]} silhouette challenge`,
  };
}


// Master collection: 150 additional silhouettes for levels 151–300.
// These are deliberately distinct transformations of the hand-authored base library,
// assigned to their own collection themes rather than silently repeating levels 1–150.
const masterThemes = [
  ["Aurora","Aurora Fox","Northern Lights","Ice Crystal","Snowflake","Polar Bear","Glacier","Comet Trail","Aurora Crown","Frost Flower"],
  ["Neon City","Neon Skyline","Street Racer","Metro Train","Skyscraper","Traffic Signal","Neon Sign","Arcade Cabinet","City Bridge","Electric Tower"],
  ["Ancient","Pyramid","Sphinx","Obelisk","Temple Gate","Ankh","Pharaoh Mask","Stone Column","Ancient Coin","Sun Dial"],
  ["Crystal","Crystal Cluster","Prism Tower","Geode","Quartz Heart","Crystal Dragon","Gem Pendant","Ice Shard","Crystal Bloom","Diamond Crown"],
  ["Volcano","Volcano Peak","Lava Wave","Magma Core","Ash Cloud","Firebird","Obsidian Rock","Eruption","Flame Spiral","Lava Crown"],
  ["Dreamscape","Dream Catcher","Cloud Castle","Dream Balloon","Moon Garden","Sleeping Moon","Wish Lantern","Floating Island","Dream Key","Star Pillow"],
  ["Oceanic","Whale Tail","Coral Castle","Ocean Wave","Sea Dragon","Pearl Shell","Tidal Spiral","Deep Diver","Ocean Crown","Reef Bloom"],
  ["Clockwork","Pocket Watch","Gear Train","Clock Tower","Mechanical Bird","Pendulum","Spring Coil","Brass Key","Clockwork Heart","Time Portal"],
  ["Wildlands","Wolf Track","Eagle Wing","Forest Stag","Jungle Vine","Wildflower","Bear Claw","River Bend","Mountain Fox","Forest Crown"],
  ["Legendary","Phoenix Crest","Dragon Wing","Unicorn Star","Griffin Claw","Mermaid Tail","Thunder Hammer","Royal Shield","Mythic Flame","Legend Crown"],
  ["Infinity","Infinity Loop","Mobius Ring","Endless Knot","Quantum Wave","Fractal Star","Orbit Gate","Mirror Maze","Infinity Bloom","Eternal Crown"],
  ["Eclipse","Solar Eclipse","Lunar Shadow","Black Sun","Corona Ring","Shadow Mask","Eclipse Wing","Dark Star","Twilight Gate","Eclipse Crown"],
  ["Starlight","Constellation","Shooting Star","Star Map","Moon Rover","Astral Compass","Planet Ring","Star Lantern","Cosmic Flower","Starlight Crown"],
  ["Obsidian","Obsidian Blade","Dark Crystal","Basalt Tower","Night Raven","Black Lotus","Shadow Gem","Obsidian Gate","Void Mask","Obsidian Crown"],
  ["Grand Finale","Bloom Spiral","Grand Petal","Radiant Heart","Final Key","Celestial Rose","Prism Phoenix","Eternal Garden","Master Emblem","Final Bloom"]
];

for (let level = 151; level <= 300; level++) {
  const offset = level - 151;
  const collectionId = 16 + Math.floor(offset / 10);
  const shapeIndex = offset % 10;
  const base = SHAPE_DEFINITIONS[baseShapeIds[(offset * 11 + Math.floor(offset / 4) * 3) % baseShapeIds.length]];
  const angle = ((offset % 9) - 4) * 0.115;
  const scaleX = 0.76 + ((offset * 5) % 7) * 0.045;
  const scaleY = 0.76 + ((offset * 3 + 2) % 7) * 0.045;
  const mirror = Math.floor(offset / 2) % 2 === 1;
  const polygons = base.polygons.map((poly) => poly.map(([x, y]) => {
    const px = (mirror ? 1 - x : x) - 0.5;
    const py = y - 0.5;
    // Gentle deterministic warp adds a new silhouette rhythm while keeping the
    // source shape inside the board and connected.
    const wave = Math.sin((px * 5 + py * 3 + offset * 0.37) * Math.PI) * 0.018;
    const rx = px * Math.cos(angle) - py * Math.sin(angle) + wave;
    const ry = px * Math.sin(angle) + py * Math.cos(angle) - wave;
    return [
      Math.max(0.035, Math.min(0.965, 0.5 + rx * scaleX)),
      Math.max(0.035, Math.min(0.965, 0.5 + ry * scaleY)),
    ] as [number, number];
  }));
  SHAPE_DEFINITIONS[level] = {
    id: `master_${level}_${masterThemes[collectionId - 16][shapeIndex].toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: `Master ${masterThemes[collectionId - 16][0]} ${masterThemes[collectionId - 16][shapeIndex]}`,
    collectionId,
    polygons,
    description: `Master collection: ${masterThemes[collectionId - 16][0]} challenge`,
  };
}
