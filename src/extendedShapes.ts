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
  const scaleX = 0.86 + ((offset * 5) % 7) * 0.032;
  const scaleY = 0.86 + ((offset * 3 + 2) % 7) * 0.032;
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
  const themeWord = masterThemes[collectionId - 16][0];
  const subName = masterThemes[collectionId - 16][shapeIndex];
  const fullName = subName.toLowerCase().includes(themeWord.toLowerCase())
    ? `Master ${subName}`
    : `Master ${themeWord} ${subName}`;
  SHAPE_DEFINITIONS[level] = {
    id: `master_${level}_${subName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: fullName,
    collectionId,
    polygons,
    description: `Master collection: ${themeWord} challenge`,
  };
}

// Apex collections: 200 additional silhouettes for levels 301–500 (collections 31–50).
const apexThemes: Array<[string, ...string[]]> = [
  ["Mirage", "Oasis Palm", "Sand Dune", "Desert Horizon", "Sunstone Crest", "Camel Caravan", "Sirocco Wind", "Nomad Tent", "Dune Lotus", "Sunset Arch", "Mirage Crown"],
  ["Frostbite", "Glacier Spire", "Frost Fern", "Blizzard Owl", "Icicle Cavern", "Arctic Fox", "Snow Crest", "Permafrost", "Winter Wolf", "Crystal Tundra", "Frost Crown"],
  ["Nebula Rush", "Plasma Comet", "Ion Gate", "Star Cluster", "Hypernova", "Deep Pulsar", "Cosmic Prism", "Photon Ribbon", "Void Horizon", "Gravity Well", "Nebula Crown"],
  ["Jade Temple", "Pagoda Roof", "Jade Dragon", "Bamboo Mist", "Stone Lantern", "Lotus Gate", "Sacred Koi", "Tea Pavilion", "Bell Shrine", "Silk Fan", "Jade Crown"],
  ["Cyber Pulse", "Data Core", "Hex Matrix", "Laser Grid", "Synth Falcon", "Holo Blade", "Pulse Beacon", "Signal Tower", "Vector Node", "Logic Spire", "Cyber Crown"],
  ["Solar Flare", "Sunspot Eye", "Corona Blaze", "Radiant Wing", "Amber Orbit", "Dawn Chariot", "Helios Shield", "Phoenix Torch", "Flare Spiral", "Gold Meridian", "Solar Crown"],
  ["Velvet Night", "Midnight Moth", "velvet Raven", "Crescent Vale", "Nightshade", "Dusk Owl", "Starry Mantle", "Owl Feather", "Moonlit Arch", "Shadow Iris", "Velvet Crown"],
  ["Amber Dunes", "Scarlet Canyon", "Desert Sun", "Sandglass", "Fossil Spiral", "Terracotta", "Gilded Falcon", "Bronze Oasis", "Amber Compass", "Red Mesa", "Amber Crown"],
  ["Arcane", "Rune Seal", "Spell Sigil", "Astral Owl", "Mystic Grimoire", "Alchemist Flask", "Ether Wheel", "Oracle Eye", "Mana Crystal", "Ward Gate", "Arcane Crown"],
  ["Prism Forge", "Refraction Gate", "Spectrum Anvil", "Chroma Hammer", "Glass Ember", "Facet Vault", "Beam Splitter", "Opal Forge", "Mirror Blade", "Rainbow Core", "Prism Crown"],
  ["Skyborne", "Cloud Rider", "Wind Glider", "Sky Galleon", "Zephyr Wing", "Cumulus Spire", "Storm Kite", "Albatross", "Thunder Crest", "Stratos Arch", "Skyborne Crown"],
  ["Coral Abyss", "Trench Pearl", "Nautilus Eye", "Sunken Spire", "Reef Titan", "Luminous Eel", "Abyssal Fan", "Bathysphere", "Sea Anemone", "Deep Current", "Abyss Crown"],
  ["Starforge", "Anvil Pulsar", "Meteor Crest", "Stellar Loom", "Nebula Crucible", "Orbit Ring", "Forge Hammer", "Binary Sun", "Astrolabe", "Crucible Wing", "Starforge Crown"],
  ["Emerald Mist", "Moss Golem", "Fern Canopy", "Verdant Stag", "Jade Brook", "Clover Shrine", "Forest Spirit", "Vine Cathedral", "Sage Lantern", "Dewdrop Leaf", "Emerald Crown"],
  ["Chronos", "Hourglass Gate", "Pendulum Spire", "Tempo Wheel", "Sundial Vault", "Epoch Gear", "Minute Wing", "Timekeeper", "Infinite Dial", "Past Echo", "Chronos Crown"],
  ["Radiant Peak", "Summit Beacon", "Alpine Dawn", "Eagle Eyrie", "Ridge Bastion", "Cloud Summit", "Granite Horn", "Glacial Pass", "Aether Crest", "Highland Gate", "Peak Crown"],
  ["Phantom Maze", "Specter Gate", "Mist Corridor", "Mirrored Hall", "Gossamer Web", "Wisp Lantern", "Veiled Key", "Shadow Loop", "Astral Veil", "Echo Chamber", "Phantom Crown"],
  ["Celestial", "Seraph Wing", "Halo Gate", "Star Harp", "Heavenly Arch", "Comet Mantle", "Chalice Star", "Zenith Seal", "Vesper Bell", "Moonlit Choir", "Celestial Crown"],
  ["Nova Core", "Supernova", "Fusion Ring", "Plasma Heart", "Singularity", "Photon Cage", "Antimatter", "Ignition Gate", "Solaris Gem", "Quasar Beam", "Nova Crown"],
  ["Eternal Bloom", "Genesis Petal", "Sovereign Rose", "Mythic Lotus", "Infinite Garden", "Dawn Blossom", "Sacred Corolla", "Zenith Orchid", "Imperial Bloom", "Origin Emblem", "Eternal Crown"]
];

for (let level = 301; level <= 500; level++) {
  const offset = level - 301;
  const collectionId = 31 + Math.floor(offset / 10);
  const themeEntry = apexThemes[collectionId - 31];
  const themeName = themeEntry[0];
  const shapeSubName = themeEntry[1 + (offset % 10)];
  const base = SHAPE_DEFINITIONS[baseShapeIds[(offset * 13 + Math.floor(offset / 5) * 7 + 3) % baseShapeIds.length]];
  const angle = ((offset % 11) - 5) * 0.105;
  const scaleX = 0.88 + ((offset * 7) % 6) * 0.032;
  const scaleY = 0.88 + ((offset * 5 + 1) % 6) * 0.032;
  const mirror = offset % 3 === 1;
  const polygons = base.polygons.map((poly) => poly.map(([x, y]) => {
    const px = (mirror ? 1 - x : x) - 0.5;
    const py = y - 0.5;
    const wave = Math.sin((px * 6 - py * 4 + offset * 0.43) * Math.PI) * 0.016;
    const rx = px * Math.cos(angle) - py * Math.sin(angle) + wave;
    const ry = px * Math.sin(angle) + py * Math.cos(angle) - wave;
    return [
      Math.max(0.035, Math.min(0.965, 0.5 + rx * scaleX)),
      Math.max(0.035, Math.min(0.965, 0.5 + ry * scaleY)),
    ] as [number, number];
  }));
  const isApexFinale = level === 500;
  const formattedSub = shapeSubName.charAt(0).toUpperCase() + shapeSubName.slice(1);
  const fullName = formattedSub.toLowerCase().includes(themeName.toLowerCase())
    ? formattedSub
    : `${themeName} ${formattedSub}`;
  SHAPE_DEFINITIONS[level] = {
    id: `apex_${level}_${formattedSub.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: fullName,
    collectionId,
    polygons: isApexFinale
      ? [[[0.06, 0.06], [0.94, 0.06], [0.94, 0.94], [0.06, 0.94]]]
      : polygons,
    description: `${themeName} master challenge`,
  };
}

