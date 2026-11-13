# Arrow Bloom

Arrow Bloom is a colourful silhouette puzzle game built with React, TypeScript and Vite.

## Game content

- 500 levels arranged into 50 themed collections.
- 50 themed collections, including distinct Master and Apex collections for deeper play.
- Level difficulty scales with grid size and arrow-path complexity.
- Progress is saved locally with an automatic rolling recovery copy and manual JSON export/import.
- Daily puzzle selection is deterministic and works offline; the core Android game is bundled locally.

## Run locally

```bash
npm install
npm run dev
```

## Build the web game

```bash
npm run lint
npm run build
```

## Android APK

The project uses Capacitor. The first Android setup and local build can be run with:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Automatic GitHub build and release

Every push to `main` starts the **Android APK** GitHub Actions workflow. It installs dependencies, type-checks the project, builds the web game, syncs the Android project, creates a debug APK, uploads it as a workflow artifact, and publishes a GitHub Release containing the APK.

You can also start the workflow manually from **Actions → Android APK → Run workflow**.

**Signing note:** the automated APK is debug-signed for testing. A Play Store production release requires a private signing keystore and protected GitHub Actions secrets; do not store a keystore or passwords in the repository.
