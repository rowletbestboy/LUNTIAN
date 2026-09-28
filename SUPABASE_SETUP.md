# Supabase setup

LUNTIAN uses Supabase Auth and Postgres for administrator accounts, managed asset registrations, outlet schedules, and the ESP32 demo's telemetry/relay-command queue. The website no longer displays fabricated measurement values; sections without a connected data source show a no-live-readings state.

The live dashboard, water overview, tank monitoring, device inventory, telemetry alerts, water/environment analytics, and sensor/controller CSV/PDF reports use recorded ESP32 data. Energy savings is an estimator based only on values entered by an administrator. Campus electricity/carbon totals and water consumed volume remain unavailable until electricity and water-flow meters are installed. Schedules and custom automation rules can be saved, but the current ESP32 firmware does not fetch/execute them; its built-in temperature and tank-full safety cutoffs run locally.

## Create the free backend

1. Create a project at [supabase.com](https://supabase.com) using the free plan.
2. In the Supabase SQL Editor, run the contents of `supabase/schema.sql`. If you already applied an earlier version, rerun this updated script; its policy definitions are safe to recreate and it adds optional device locations and persistent automation-rule storage.
3. In Authentication settings, turn off public sign-ups. Create administrator users from the Supabase Dashboard's user management page.
4. In Project Settings > API, copy the Project URL and the publishable key (or legacy `anon` key). Never use the `service_role` key in this frontend.
5. Create `.env.local` in the project root (beside `package.json`) with these values:

	```dotenv
	VITE_SUPABASE_URL=https://your-project-id.supabase.co
	VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
	VITE_DEMO_DEVICE_ID=luntian-demo-esp32-01
	```

	Replace the first two values with the values from Project Settings > API. The demo device ID must match the ESP32 sketch and the row registered in `public.devices`.
6. Restart the Vite server after changing `.env.local`, then sign in with an administrator account created in step 3.

The database tables enforce per-user access with Row Level Security. Each admin sees only the managed assets, schedules, and device records assigned to that Supabase account. Assign a real `building_name` and `room_name` to each device row so the device and room pages can group it correctly. For ESP32 provisioning and the location SQL, continue with [firmware/README.md](firmware/README.md).

## Run locally

```powershell
npm install
npm run dev
```

The Supabase project is the hosted backend, so no separate API server is needed. Keep `.env.local` private. The URL and publishable/anon key are designed for browser use with the included Row Level Security policies. Never place the Supabase `service_role` key in the website or ESP32.