# Arrow Bloom 🌸🏹

A colorful, vibrant arrow-escape logic puzzle game built with React, TypeScript, and Tailwind CSS.
Features 50 deterministic, guaranteed-solvable levels across 5 whimsical worlds, procedural Web Audio sound synthesis, color-blind accessibility mode, pinch-to-zoom/pan on larger boards, undo/hints, and offline storage.

---

## 🚀 Running the Game Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

3. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## 📱 Converting to an Android App with Capacitor (for Google Play Store)

Because **Arrow Bloom** has zero backend dependencies, works 100% offline, and strictly follows mobile touch guidelines (`touch-action: manipulation`, viewport safe-area insets, and high performance SVG rendering), it is ready to be wrapped as a native Android APK / Android App Bundle (`.aab`) with Capacitor:

### Step 1: Install Capacitor CLI & Core
In the project directory, run:
```bash
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor Configuration
```bash
npx cap init "Arrow Bloom" "com.arrowbloom.game" --web-dir dist
```

### Step 3: Add Android Platform
```bash
npm run build
npx cap add android
```

### Step 4: Add Splash Screen & Status Bar Plugins (Optional but Recommended)
```bash
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/haptics
npx cap sync
```

### Step 5: Open in Android Studio & Build for Google Play
```bash
npx cap open android
```
Inside Android Studio:
1. Go to **Build** > **Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)** for Google Play.
3. Select your release keystore key (or generate a new release key).
4. Select `release` build variant with V2 full APK signing.
5. Upload the generated `.aab` file to your Google Play Console under **Production** (or **Closed Testing** track).

---

## 🎮 Game Controls & Keyboard Shortcuts

- **Touch / Mouse Click:** Tap any arrow to set it free.
- **Arrow Keys:** Cycle focus through arrows on the board.
- **Enter / Space:** Select/release the focused arrow or start game from home screen.
- **R:** Restart current level.
- **U:** Undo last removed arrow.
- **H:** Reveal a free arrow hint (up to 3 per level).
- **Esc:** Return to level select or home screen.
