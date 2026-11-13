/**
 * Generates Android mipmap launcher icons, adaptive foregrounds,
 * backgrounds, and web icons from Arrow Bloom's official logo.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const LOGO_PNG = path.join(ROOT_DIR, 'public', 'logo.png');
const ICON_PNG = path.join(ROOT_DIR, 'public', 'icon.png');
const SOURCE_IMAGE = fs.existsSync(LOGO_PNG) ? LOGO_PNG : ICON_PNG;
const RES_DIR = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res');

const MIPMAP_SIZES = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
];

async function generate() {
  console.log(`🌸 Generating Arrow Bloom Android launcher icons from: ${SOURCE_IMAGE}`);

  if (!fs.existsSync(SOURCE_IMAGE)) {
    throw new Error(`Source logo not found at ${SOURCE_IMAGE}`);
  }

  // 1. Generate Web PWA icons & favicons in public/
  await sharp(SOURCE_IMAGE).resize(192, 192).toFile(path.join(ROOT_DIR, 'public', 'icon-192.png'));
  await sharp(SOURCE_IMAGE).resize(512, 512).toFile(path.join(ROOT_DIR, 'public', 'icon-512.png'));
  await sharp(SOURCE_IMAGE).resize(192, 192).toFile(path.join(ROOT_DIR, 'public', 'pwa-192x192.png'));
  await sharp(SOURCE_IMAGE).resize(512, 512).toFile(path.join(ROOT_DIR, 'public', 'pwa-512x512.png'));
  await sharp(SOURCE_IMAGE).resize(180, 180).toFile(path.join(ROOT_DIR, 'public', 'apple-touch-icon.png'));
  await sharp(SOURCE_IMAGE).resize(64, 64).toFile(path.join(ROOT_DIR, 'public', 'favicon.png'));

  const maskableInner = 400; // 78% of 512 inside 80% safe zone
  const maskablePad = Math.round((512 - maskableInner) / 2);
  const maskableLogo = await sharp(SOURCE_IMAGE).resize(maskableInner, maskableInner, { fit: 'contain' }).toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 14, b: 40, alpha: 1 },
    },
  })
    .composite([{ input: maskableLogo, top: maskablePad, left: maskablePad }])
    .png()
    .toFile(path.join(ROOT_DIR, 'public', 'pwa-maskable-512x512.png'));

  console.log('✔ Generated web PWA icons: pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png, apple-touch-icon.png, favicon.png');

  if (!fs.existsSync(RES_DIR)) {
    console.warn(`Android res directory not found at ${RES_DIR}. Skipping native icons.`);
    return;
  }

  // 2. Generate Mipmap Icons
  for (const { folder, iconSize, fgSize } of MIPMAP_SIZES) {
    const dir = path.join(RES_DIR, folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png (Full squircle with flower & shooting arrow)
    await sharp(SOURCE_IMAGE)
      .resize(iconSize, iconSize)
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png
    await sharp(SOURCE_IMAGE)
      .resize(iconSize, iconSize)
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Safe-padded centered logo for adaptive launcher)
    // Scale source to ~78% of fgSize and pad with transparent margin to prevent clipping
    const innerSize = Math.round(fgSize * 0.78);
    const padding = Math.round((fgSize - innerSize) / 2);

    const resizedLogo = await sharp(SOURCE_IMAGE)
      .resize(innerSize, innerSize, { fit: 'contain' })
      .toBuffer();

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`✔ Generated ${folder}: ${iconSize}x${iconSize} (icon) & ${fgSize}x${fgSize} (fg)`);
  }

  // 3. Adaptive background drawable (Matching deep midnight navy gradient)
  const drawableDir = path.join(RES_DIR, 'drawable');
  if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });

  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <gradient
        android:angle="270"
        android:startColor="#12163A"
        android:centerColor="#0B0E28"
        android:endColor="#060818"
        android:type="linear" />
</shape>
`;
  fs.writeFileSync(path.join(drawableDir, 'ic_launcher_background.xml'), bgXml, 'utf-8');
  console.log('✔ Updated drawable/ic_launcher_background.xml with midnight gradient');

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
    <color name="ic_launcher_background">#0B0E28</color>
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

  console.log('🎉 All Android app icons updated with the new official Arrow Bloom logo!');
}

generate().catch((err) => {
  console.error('Failed to generate Android icons:', err);
  process.exit(1);
});
