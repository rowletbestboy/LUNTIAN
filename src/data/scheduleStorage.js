import { requireSupabase } from "../lib/supabase";

export async function loadSchedule(userId, buildingName, deviceName) {
  const { data, error } = await requireSupabase()
    .from("device_schedules")
    .select("days")
    .eq("owner_id", userId)
    .eq("building_name", buildingName)
    .eq("device_name", deviceName)
    .maybeSingle();

  if (error) throw error;
  return data?.days || null;
}

export async function saveSchedule(userId, buildingName, deviceName, days) {
  const { error } = await requireSupabase()
    .from("device_schedules")
    .upsert({
      owner_id: userId,
      building_name: buildingName,
      device_name: deviceName,
      days,
      updated_at: new Date().toISOString(),
    }, { onConflict: "owner_id,building_name,device_name" });

  if (error) throw error;
}