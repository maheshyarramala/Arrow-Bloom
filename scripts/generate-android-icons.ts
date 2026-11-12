/**
 * Generates Android mipmap launcher icons, adaptive foregrounds,
 * backgrounds, and web icons from Arrow Bloom's default logo (🌸).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const ICON_SVG = path.join(ROOT_DIR, 'public', 'icon.svg');
const FOREGROUND_SVG = path.join(ROOT_DIR, 'public', 'icon-foreground.svg');
const RES_DIR = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res');

const MIPMAP_SIZES = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
];

async function generate() {
  console.log('🌸 Generating Arrow Bloom Android launcher icons...');

  if (!fs.existsSync(ICON_SVG)) {
    throw new Error(`icon.svg not found at ${ICON_SVG}`);
  }

  // 1. Generate Web PWA icons in public/
  await sharp(ICON_SVG).resize(192, 192).toFile(path.join(ROOT_DIR, 'public', 'icon-192.png'));
  await sharp(ICON_SVG).resize(512, 512).toFile(path.join(ROOT_DIR, 'public', 'icon-512.png'));
  console.log('✔ Generated web PWA icons: icon-192.png, icon-512.png');

  if (!fs.existsSync(RES_DIR)) {
    console.warn(`Android res directory not found at ${RES_DIR}. Skipping native icons.`);
    return;
  }

  // 2. Generate Mipmap Icons
  for (const { folder, iconSize, fgSize } of MIPMAP_SIZES) {
    const dir = path.join(RES_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png (Full squircle with flower)
    await sharp(ICON_SVG)
      .resize(iconSize, iconSize)
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png
    await sharp(ICON_SVG)
      .resize(iconSize, iconSize)
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Transparent flower for adaptive icon)
    const fgSource = fs.existsSync(FOREGROUND_SVG) ? FOREGROUND_SVG : ICON_SVG;
    await sharp(fgSource)
      .resize(fgSize, fgSize)
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✔ Generated ${folder}: ${iconSize}x${iconSize} (icon) & ${fgSize}x${fgSize} (fg)`);
  }

  // 3. Adaptive background drawable (Gradient from pink to rose to indigo)
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });

  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <gradient
        android:angle="315"
        android:startColor="#EC4899"
        android:centerColor="#F43F5E"
        android:endColor="#4F46E5"
        android:type="linear" />
</shape>
`;
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), bgXml, 'utf-8');
  console.log('✔ Updated drawable/ic_launcher_background.xml with gradient');

  // 4. Remove default Capacitor vector foreground if it overrides mipmaps
  const v24Dir = path.join(RES_DIR, 'drawable-v24');
  const v24Fg = path.join(v24Dir, 'ic_launcher_foreground.xml');
  if (fs.existsSync(v24Fg)) {
    fs.unlinkSync(v24Fg);
    console.log('✔ Removed default Capacitor drawable-v24/ic_launcher_foreground.xml');
  }

  // 5. Update values/ic_launcher_background.xml
  const valuesDir = path.join(RES_DIR, 'values');
  if (!fs.existsSync(valuesDir)) fs.mkdirSync(valuesDir, { recursive: true });
  const valBgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#F43F5E</color>
</resources>
`;
  fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), valBgXml, 'utf-8');

  // 6. Update mipmap-anydpi-v26 adaptive XMLs
  const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiDir)) fs.mkdirSync(anydpiDir, { recursive: true });

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf-8');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf-8');
  console.log('✔ Updated mipmap-anydpi-v26/ic_launcher.xml and round.xml');

  console.log('🎉 All Android app icons updated successfully!');
}

generate().catch((err) => {
  console.error('Failed to generate Android icons:', err);
  process.exit(1);
});
