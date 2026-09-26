const STORAGE_KEY = "luntian-managed-assets";

const EMPTY_ASSETS = {
  buildings: [],
  rooms: [],
  tanks: [],
  sockets: [],
};

export function loadManagedAssets() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(
      Object.keys(EMPTY_ASSETS).map((key) => [
        key,
        Array.isArray(stored[key]) ? stored[key] : [],
      ])
    );
  } catch {
    return EMPTY_ASSETS;
  }
}

export function saveManagedAssets(assets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}