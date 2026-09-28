import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function authenticateDevice(request: Request, deviceId: string) {
  const token = request.headers.get("x-device-token");
  if (!token) return { device: null, error: "device token header is missing", status: 401 };

  const { data: device, error } = await supabase
    .from("devices")
    .select("device_id, owner_id, active, token_hash")
    .eq("device_id", deviceId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Device lookup failed:", error.message);
    return { device: null, error: "device lookup failed; check database schema and function configuration", status: 500 };
  }
  if (!device) return { device: null, error: "device ID not found or device is inactive", status: 404 };
  if (await sha256(token) !== device.token_hash) {
    return { device: null, error: "device token does not match the registered token hash", status: 401 };
  }
  return { device, error: null, status: 200 };
}

function finiteOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(request.url);
  const route = url.pathname.split("/").filter(Boolean).at(-1);
  const initialBody = request.method === "POST" ? await request.clone().json().catch(() => null) : null;
  const deviceId = request.method === "GET"
    ? url.searchParams.get("device_id") || ""
    : String(initialBody?.device_id || "");

  if (!deviceId) return response({ error: "device_id is required" }, 400);
  const authentication = await authenticateDevice(request, deviceId);
  if (!authentication.device) return response({ error: authentication.error }, authentication.status);
  const { device } = authentication;

  if (request.method === "POST" && route === "telemetry") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.temp_relay_on !== "boolean" || typeof body.water_relay_on !== "boolean"
      || typeof body.temp_overheat !== "boolean" || typeof body.water_full !== "boolean"
      || typeof body.dht_sensor_fault !== "boolean" || typeof body.water_sensor_fault !== "boolean") {
      return response({ error: "invalid telemetry payload" }, 400);
    }

    const temperature = finiteOrNull(body.temperature_c);
    const humidity = finiteOrNull(body.humidity_pct);
    const distance = finiteOrNull(body.water_distance_cm);
    const level = finiteOrNull(body.water_level_pct);
    if ((temperature !== null && (temperature < -40 || temperature > 125))
      || (humidity !== null && (humidity < 0 || humidity > 100))
      || (distance !== null && (distance < 0 || distance > 500))
      || (level !== null && (level < 0 || level > 100))) {
      return response({ error: "sensor value outside allowed range" }, 400);
    }

    const measuredAt = new Date(body.measured_at || Date.now());
    const reading = {
      device_id: device.device_id,
      owner_id: device.owner_id,
      measured_at: Number.isNaN(measuredAt.getTime()) ? new Date().toISOString() : measuredAt.toISOString(),
      temperature_c: temperature,
      humidity_pct: humidity,
      water_distance_cm: distance,
      water_level_pct: level,
      temp_relay_on: body.temp_relay_on,
      water_relay_on: body.water_relay_on,
      temp_overheat: body.temp_overheat,
      water_full: body.water_full,
      dht_sensor_fault: body.dht_sensor_fault,
      water_sensor_fault: body.water_sensor_fault,
    };
    const [{ error: insertError }, { error: updateError }] = await Promise.all([
      supabase.from("device_telemetry").insert(reading),
      supabase.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("device_id", device.device_id),
    ]);
    if (insertError || updateError) return response({ error: "could not store telemetry" }, 500);
    return response({ accepted: true });
  }

  if (request.method === "GET" && route === "command") {
    const { data: command, error } = await supabase
      .from("device_commands")
      .select("id, action")
      .eq("device_id", device.device_id)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) return response({ error: "could not retrieve command" }, 500);
    return response(command || { command: null });
  }

  if (request.method === "POST" && route === "ack") {
    const body = await request.json().catch(() => null);
    if (!body?.command_id || !["completed", "rejected"].includes(body.status)) {
      return response({ error: "command_id and a valid status are required" }, 400);
    }
    const { data, error } = await supabase
      .from("device_commands")
      .update({ status: body.status, result: String(body.result || "").slice(0, 200), completed_at: new Date().toISOString() })
      .eq("id", body.command_id)
      .eq("device_id", device.device_id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (error) return response({ error: "could not acknowledge command" }, 500);
    if (!data) return response({ error: "command not found or already handled" }, 404);
    return response({ accepted: true });
  }

  return response({ error: "route not found" }, 404);
});