# NagiStudio

NagiStudio is a responsive starter for a visual bot-building platform inspired by no-code bot tools.

## Included
- Responsive dashboard and navigation
- Bot list with platform/status filters
- Visual flow-builder starter with draggable-style node cards
- Template gallery and activity feed
- Local UI interactions (create bot, search, switch views)

## Run locally
Requires Node.js 20+.
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

## Important
This commit is a frontend MVP/starter, not a production bot-hosting service. Real bot connections, OAuth, secure credential storage, API, database, queues, worker isolation, billing, and Android packaging still need implementation. Never paste bot tokens into frontend code or commit secrets. Integrations should use official platform APIs and permissions.
