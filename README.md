# NagiStudio

NagiStudio is a cross-platform starter for a visual bot-building platform inspired by no-code bot tools.

## Included now
- Responsive React + TypeScript website dashboard
- Bot list with search and platform filters
- Starter flow-builder canvas and template gallery
- Local UI interactions (create bot, filter bots, switch views)
- Android app starter using Kotlin + Jetpack Compose
- GitHub Actions workflow that builds the web app on push/PR

## Run the website
Requires Node.js 20+.
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Build the website
```bash
npm run build
npm run preview
```

## Open the Android app
Install Android Studio (current stable) with Android SDK 35 and JDK 17. Open this repository folder as a project and let Gradle sync. Run the `:app` configuration on an emulator or Android device. An Android APK has **not** been built or tested in this repository yet.

## Important limitations
This is an MVP starter, not a production bot-hosting service. Real bot connections, OAuth, secure credential storage, API, database, queues, worker isolation, billing, fully interactive flow editing, and release APK packaging still need implementation. Never paste bot tokens into frontend code or commit secrets. Use official platform APIs and permissions.
