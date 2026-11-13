# Local authentication testing (free)

This setup is for local development only. It does not change the hosted Play2Prove Supabase project or production authentication settings.

## Why use the local stack?

Supabase local Auth sends confirmation and recovery emails to the local Mailpit inbox. Messages do not leave your computer and local Auth has no hourly email limit. Email confirmation remains enabled so the real verification flow can be tested.

## One-time setup

Requirements: Docker Desktop (running) and the Supabase CLI.

1. From the repository root, link the CLI to the existing hosted project:

   ```bash
   supabase login
   supabase link --project-ref wkxrdewftzcpemonjnih
   ```

   The CLI may ask for the hosted database password. This is only used to connect for the schema pull; do not put it in a committed file.

2. The repository currently has no checked-in Supabase migrations. Pull the hosted database schema into local migration files:

   ```bash
   supabase db pull
   ```

   Review the generated files before committing them. This pulls schema/migration state; it does not copy production user data into the local database.

3. Start the local Supabase stack:

   ```bash
   supabase start
   supabase status
   ```

4. Open the Mailpit inbox at **http://127.0.0.1:54324**. Local Auth API is normally **http://127.0.0.1:54321**.

5. Create/update the untracked `.env.local` in the repository root using the local **API URL** and **publishable key** printed by `supabase status`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_WITH_LOCAL_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Never use a production secret/service-role key in browser environment variables. Do not commit `.env.local`.

6. Restart Next.js (`npm run dev`). Test sign-up, open the confirmation email in Mailpit, then test forgot-password and open its recovery email there. Links should return to localhost.

## Switch back to hosted development

Stop the local stack with `supabase stop`, restore the hosted project URL and publishable key in your local environment file, then restart Next.js. Hosted built-in email sending still has provider limits; local Mailpit is the no-quota test path.

## Important boundaries

- Local and hosted Auth users/sessions are separate. A local test account does not become a production account.
- Local database schema is pulled from the hosted project, but production data is not copied. Seed only synthetic test records locally.
- Keep email confirmation enabled in hosted production. Do not turn it off just to bypass email limits.
- The Google OAuth provider needs a separate local OAuth callback configuration if you want to test Google sign-in locally. Do not reuse production OAuth secrets in a committed config file.
- This local setup has not been runtime-tested on your computer; Docker and the CLI must be installed and running first.
