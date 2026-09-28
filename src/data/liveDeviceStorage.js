import { requireSupabase } from "../lib/supabase";

export async function loadLiveDevices(userId) {
  const client = requireSupabase();
  const [{ data: devices, error: deviceError }, { data: tanks, error: tankError }] = await Promise.all([
    client
      .from("devices")
      .select("device_id, display_name, building_name, room_name, active, last_seen_at")
      .eq("owner_id", userId)
      .eq("active", true)
      .order("display_name"),
    client
      .from("managed_assets")
      .select("id, data")
      .eq("owner_id", userId)
      .eq("kind", "tanks"),
  ]);

  if (deviceError) throw deviceError;
  if (tankError) throw tankError;
  if (!devices.length) return [];

  const deviceIds = devices.map((device) => device.device_id);
  const { data: readings, error: readingError } = await client
    .from("device_telemetry")
    .select("device_id, measured_at, temperature_c, humidity_pct, water_distance_cm, water_level_pct, temp_relay_on, water_relay_on, temp_overheat, water_full, dht_sensor_fault, water_sensor_fault")
    .eq("owner_id", userId)
    .in("device_id", deviceIds)
    .order("measured_at", { ascending: false })
    .limit(5000);

  if (readingError) throw readingError;

  const latestByDevice = new Map();
  for (const reading of readings) {
    if (!latestByDevice.has(reading.device_id)) latestByDevice.set(reading.device_id, reading);
  }

  const tankByDevice = new Map();
  for (const row of tanks) {
    const deviceId = row.data?.deviceId?.trim();
    if (deviceId) tankByDevice.set(deviceId, { ...row.data, id: row.id });
  }

  return devices.map((device) => {
    const telemetry = latestByDevice.get(device.device_id) || null;
    const readingAgeMs = telemetry ? Date.now() - new Date(telemetry.measured_at).getTime() : Infinity;
    return {
      ...device,
      telemetry,
      tank: tankByDevice.get(device.device_id) || null,
      online: readingAgeMs >= 0 && readingAgeMs < 30000,
    };
  });
}