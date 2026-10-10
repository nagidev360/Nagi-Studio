# NagiStudio

NagiStudio is a responsive React + TypeScript bot workspace with an Android starter, authenticated integrations UI, a Node API, and a background bot worker.

## What's included

- Responsive website dashboard, bot list/search, templates, and starter flow builder
- Supabase email authentication for the integrations screen
- Discord and Telegram token verification against official APIs
- Bot tokens encrypted at rest using AES-256-GCM; tokens are never returned by the API
- Supabase migration with row-level security and owner-scoped records
- Render Blueprint for frontend, API, and an always-on bot worker
- GitHub Actions workflows for web validation and Android debug APK artifacts
- Runtime commands: Discord `!ping` / `!help`; Telegram `/start`, `/ping`, `/help`

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

API (in another terminal):

```bash
cd server
npm install
npm start
```

The API requires the environment variables in [`.env.example`](.env.example). Set frontend variables in a root `.env.local` file. Never commit real keys or tokens.

## Deploy with Render + Supabase

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/202610100001_integrations.sql` from Supabase **SQL Editor**.
3. In Supabase Auth, enable Email sign-in. Configure production email/SMTP and redirect URLs as needed.
4. Open the [Render Blueprint setup](https://dashboard.render.com/blueprint/new?repo=https://github.com/nagidev360/Nagi-Studio) and apply `render.yaml`.
5. Set secrets in the Render dashboard:
   - API and worker: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the same `TOKEN_ENCRYPTION_KEY`.
   - API: `CORS_ORIGIN` set to the exact deployed website origin, e.g. `https://nagistudio-web.onrender.com`.
   - Website: `VITE_API_URL` set to the API base URL, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
6. Generate a unique 32-byte encryption key (64 hex characters), for example with Node.js:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Store the same key in API and worker settings. Keep the service-role key and encryption key out of GitHub and all `VITE_*` variables.
7. Redeploy the website after setting its `VITE_*` build variables. Set Supabase Auth's Site URL and allowed redirect URLs to your deployed website.
8. Invite the bot to your Discord server / start the Telegram bot. Discord requires the **Message Content Intent** enabled in the Discord Developer Portal for `!ping` and `!help`. If Telegram polling cannot start because a webhook is already configured, remove that webhook before using this worker.

**Cost note:** the Render background worker is configured on the Starter plan because a persistent process is needed for always-on bot connections; this may incur charges. The website/API can be adjusted to fit your chosen Render plan.

## Android APK

Open the repository in Android Studio (JDK 17, Android SDK 35) to run locally. To build in GitHub, go to **Actions → Android debug APK → Run workflow**. After it succeeds, open that run and download the `nagistudio-debug-apk` artifact. It is a debug APK, not a signed Play Store release.

## Security and current scope

- Tokens are validated before being encrypted and saved; encrypted credentials are decrypted only in the worker process.
- Supabase service-role keys and encryption keys belong only in Render's backend environment.
- The starter worker handles simple ping/help commands; it is not yet a full visual workflow execution engine. Add moderation, permissions, command configuration, reconnect monitoring, and production observability before public launch.
- Do not commit real tokens, service keys, or production environment files.
