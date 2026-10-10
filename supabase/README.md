# Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste and run `migrations/202610100001_integrations.sql`.
3. In **Authentication → Providers**, enable Email. For production, keep email confirmation enabled and configure SMTP.
4. Copy the project URL and the publishable/anon key into the Render **nagistudio-web** environment as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Add the project URL and **service_role** key only to the Render API and worker services as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never put the service-role key in a `VITE_*` variable or Git.
6. Generate a separate 32-byte encryption key for `TOKEN_ENCRYPTION_KEY`. Store the exact same key in the API and worker services; do not rotate it without re-encrypting stored tokens.

The browser uses Supabase Auth for user sessions. The API verifies the session before writing data, and checks the user ID on reads/deletes. The service-role key bypasses RLS, so it must remain server-side and API authorization checks must be maintained.
