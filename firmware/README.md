# ESP32 demo connection

The demo sketch in `LuntianDemo` replaces the ESP32's standalone web page with outbound HTTPS to Supabase. It sends DHT22 and ultrasonic readings every 5 seconds, polls for relay commands every 2 seconds, and preserves the local temperature/tank safety interlocks. The temperature relay and water-inlet solenoid remain independently controlled.

## Hardware caution

The HC-SR04 Echo pin normally outputs 5 V. ESP32 GPIO is not 5 V tolerant: use a resistor divider or a proper level shifter between Echo and GPIO 33. Keep the Trigger and Echo wiring as in the firmware. Do not power the solenoid from an ESP32 GPIO; use its correctly rated driver/relay and separate supply. Have mains-voltage work reviewed by a qualified person.

Set `TANK_DEPTH_CM` in the sketch to the measured distance from the ultrasonic sensor face to the tank bottom. `FULL_LEVEL_DISTANCE_CM` must match the actual sensor-to-water distance at the desired shutoff level. Test with the valve disconnected first. Sensor faults intentionally lock the related relay off.

## Supabase deployment and device registration

1. Apply `../supabase/schema.sql` in the project's Supabase SQL Editor. This adds device, telemetry, command, and automation-rule tables with owner-scoped RLS. If it was already applied, rerun the updated script so the optional device building/room fields and automation table are added.
2. Install the Supabase CLI, sign in using `npx supabase login`, and link the project with `npx supabase link --project-ref YOUR_PROJECT_REF` from the repository root.
3. Deploy the device endpoint: `npx supabase functions deploy device-api --no-verify-jwt`. This endpoint uses its own per-device token instead of a Supabase user JWT, and the function verifies that token itself. The function uses the server-side service role key; do not add that key to the website or ESP32. The `--no-verify-jwt` option only disables the gateway's JWT check; it does not disable the function's device-token check.
4. In Supabase Authentication > Users, copy the admin user's UUID. Generate a random device token and its SHA-256 digest in PowerShell:

   ```powershell
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $bytes = New-Object byte[] 32
   $rng.GetBytes($bytes)
   $deviceToken = -join ($bytes | ForEach-Object { $_.ToString("x2") })
   $sha = [System.Security.Cryptography.SHA256]::Create()
   $tokenHash = -join ($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($deviceToken)) | ForEach-Object { $_.ToString("x2") })
   $tokenHash.Length
   $deviceToken
   $tokenHash
   ```

   Keep the token private; store its digest in the database and the raw token only in the device's ignored `secrets.h` file.
5. Insert the device in the Supabase SQL Editor, substituting the admin UUID and SHA-256 digest:

   ```sql
   insert into public.devices (device_id, owner_id, display_name, token_hash)
   values ('luntian-demo-esp32-01', 'ADMIN_USER_UUID', 'LUNTIAN Socket Demo', 'SHA256_TOKEN_HASH');
   ```

      To place an already-registered ESP32 in the website's building/room hierarchy, update its location (use a building name from the campus directory):

      ```sql
      update public.devices
      set building_name = 'College of Engineering',
         room_name = 'Room 204'
      where device_id = 'luntian-demo-esp32-01';
      ```

      Replace the example location with the actual installation. In Asset Management, register the corresponding water tank and set its Sensor / device ID to `luntian-demo-esp32-01` plus its actual capacity; the live tank pages use that capacity only to estimate liters from the measured percentage.

## Configure and flash the ESP32

1. In Arduino IDE, install the ESP32 board package and libraries **DHT sensor library** by Adafruit, **Adafruit Unified Sensor**, and **ArduinoJson**.
2. Open `LuntianDemo/LuntianDemo.ino`. Copy `secrets.example.h` to `secrets.h` in that same folder. `.gitignore` excludes `secrets.h`.
3. Fill in Wi-Fi SSID/password, the Supabase project URL ending in `/functions/v1/device-api`, the project's publishable/anon key, and the raw device token from the token-generation step.
4. Replace the CA placeholder in `SUPABASE_ROOT_CA` with the PEM root CA that validates your Supabase project host. The firmware synchronizes network time before connecting so certificate dates can be checked. Keep certificate validation enabled; do not replace it with `setInsecure()`.
5. Set the tank depth/threshold constants, choose the correct ESP32 board and port, compile, then upload. Open Serial Monitor at 115200 baud.

The ESP32 and computer used for dashboard testing need internet access. The ESP32 does not need to be reachable from the browser or share the same local network as the website; it initiates HTTPS requests outward.

## View readings and send commands

1. Set `VITE_DEMO_DEVICE_ID=luntian-demo-esp32-01` in the website's `.env.local` if using a different device ID, then restart Vite.
2. Sign in to LUNTIAN as the same Supabase admin UUID used for the device registration.
3. Open **Water → Tank Monitoring**. The Connected Demo Device panel shows temperature, humidity, calculated water level, distance, and relay states. It shows Offline if telemetry is older than 30 seconds.
4. Turn the temperature outlet or water inlet on/off. LUNTIAN queues the command; the ESP32 polls and acknowledges it. ON is disabled when the reading reports a safety lock or the device is offline. The ESP32 independently enforces its cutoffs even if the web UI is stale.

## Demo limits

The sensor values are stored every five seconds, so use this only for a small demonstration and avoid unnecessarily long runs. The device token is extractable from firmware; use a unique token per device, rotate it if exposed, and do not use this demo path as the sole safety controller for real equipment. The current website supports live device water/environment analytics and telemetry exports, but it does not measure electricity consumption or water flow. Custom automation rules can be saved in Supabase but are not fetched or executed by this firmware; only its built-in temperature and tank-full protections execute locally.