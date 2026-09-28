const EMPTY_ASSETS = {
  buildings: [],
  rooms: [],
  tanks: [],
  sockets: [],
};

import { requireSupabase } from "../lib/supabase";

export async function loadManagedAssets(userId) {
  const { data, error } = await requireSupabase()
    .from("managed_assets")
    .select("id, kind, data")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const assets = { ...EMPTY_ASSETS };
  for (const row of data) {
    assets[row.kind]?.push({ ...row.data, id: row.id });
  }
  return assets;
}

export async function saveManagedAsset(userId, kind, asset) {
  const { data, error } = await requireSupabase()
    .from("managed_assets")
    .insert({ owner_id: userId, kind, data: asset })
    .select("id, data")
    .single();

  if (error) throw error;
  return { ...data.data, id: data.id };
}