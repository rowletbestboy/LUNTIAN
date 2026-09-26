import { useMemo, useState } from "react";
import { Check, Plus, Building2, Droplet, Plug } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings, roomsByBuilding } from "../data/buildings";
import { loadManagedAssets, saveManagedAssets } from "../data/assetStorage";

const ASSET_TYPES = [
  { id: "buildings", label: "Buildings", icon: Building2 },
  { id: "tanks", label: "Water tanks", icon: Droplet },
  { id: "sockets", label: "Smart sockets", icon: Plug },
];

const INITIAL_FORMS = {
  buildings: { name: "", code: "", category: "", campus: "", latitude: "", longitude: "" },
  tanks: { buildingId: "", name: "", code: "", capacityL: "", location: "", deviceId: "", lowLevelAlertPct: "" },
  sockets: { buildingId: "", roomName: "", label: "", deviceId: "", model: "", electricalRatingW: "", status: "Pending setup" },
};

function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Field({ label, required = false, hint, children }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      <span>{label}{required && <span className="ml-1 text-crit" aria-hidden="true">*</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

const inputClass = "mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal text-ink outline-none transition-colors focus:border-accent";

function TextInput({ className = "", ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}

function SelectInput({ children, ...props }) {
  return <select className={inputClass} {...props}>{children}</select>;
}

function getBuildingOptions(assets) {
  return [
    ...buildings.map((building) => ({ id: `existing:${building.name}`, name: building.name })),
    ...assets.buildings.map((building) => ({ id: building.id, name: building.name })),
  ];
}

function getRoomOptions(assets) {
  const existingRooms = buildings.flatMap((building) =>
    (roomsByBuilding[building.name] || []).map((room) => ({
      id: `existing:${building.name}:${room.name}`,
      buildingId: `existing:${building.name}`,
      buildingName: building.name,
      name: room.name,
    }))
  );
  const buildingNames = new Map(getBuildingOptions(assets).map((building) => [building.id, building.name]));
  return [
    ...existingRooms,
    ...assets.rooms.map((room) => ({
      ...room,
      buildingName: buildingNames.get(room.buildingId) || "Unknown building",
    })),
  ];
}

function getAssetTitle(type, asset, assets) {
  if (type === "buildings") return asset.name;
  const buildingName = getBuildingOptions(assets).find((building) => building.id === asset.buildingId)?.name;
  if (type === "tanks") return `${asset.name} · ${buildingName || "Unknown building"}`;
  if (asset.buildingId && asset.roomName) return `${asset.label} · ${buildingName || "Unknown building"} / ${asset.roomName}`;
  const room = getRoomOptions(assets).find((item) => item.id === asset.roomId);
  return `${asset.label} · ${room ? `${room.buildingName} / ${room.name}` : "Unknown room"}`;
}

export default function AssetManagementPage() {
  const [assets, setAssets] = useState(loadManagedAssets);
  const [activeType, setActiveType] = useState("buildings");
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const buildingOptions = useMemo(() => getBuildingOptions(assets), [assets]);
  const roomOptions = useMemo(() => getRoomOptions(assets), [assets]);

  const updateField = (type, field, value) => {
    setForms((current) => ({
      ...current,
      [type]: { ...current[type], [field]: value },
    }));
    setError("");
    setMessage("");
  };

  const submitAsset = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = forms[activeType];
    const normalized = (value) => value.trim().toLowerCase();
    let duplicate = false;
    let newAsset;

    if (activeType === "buildings") {
      duplicate = [...buildings, ...assets.buildings].some((building) => normalized(building.name) === normalized(form.name))
        || assets.buildings.some((building) => normalized(building.code) === normalized(form.code));
      if ((form.latitude && !form.longitude) || (!form.latitude && form.longitude)) {
        setError("Enter both map coordinates, or leave both blank.");
        return;
      }
      newAsset = {
        id: createId(),
        name: form.name.trim(),
        code: form.code.trim(),
        category: form.category.trim(),
        campus: form.campus.trim(),
        coordinates: form.latitude && form.longitude ? [Number(form.latitude), Number(form.longitude)] : null,
      };
    } else if (activeType === "tanks") {
      duplicate = assets.tanks.some((tank) => tank.buildingId === form.buildingId
        && (normalized(tank.name) === normalized(form.name) || normalized(tank.code) === normalized(form.code)));
      newAsset = {
        id: createId(),
        buildingId: form.buildingId,
        name: form.name.trim(),
        code: form.code.trim(),
        capacityL: Number(form.capacityL),
        location: form.location.trim(),
        deviceId: form.deviceId.trim(),
        lowLevelAlertPct: form.lowLevelAlertPct === "" ? null : Number(form.lowLevelAlertPct),
      };
    } else {
      duplicate = assets.sockets.some((socket) =>
        ((socket.buildingId === form.buildingId && normalized(socket.roomName || "") === normalized(form.roomName))
          || getRoomOptions(assets).some((room) => room.id === socket.roomId
            && room.buildingId === form.buildingId && normalized(room.name) === normalized(form.roomName)))
        && normalized(socket.label) === normalized(form.label)
        || (form.deviceId && normalized(socket.deviceId) === normalized(form.deviceId))
      );
      newAsset = {
        id: createId(),
        buildingId: form.buildingId,
        roomName: form.roomName.trim(),
        label: form.label.trim(),
        deviceId: form.deviceId.trim(),
        model: form.model.trim(),
        electricalRatingW: form.electricalRatingW === "" ? null : Number(form.electricalRatingW),
        status: form.status,
      };
    }

    if (duplicate) {
      setError("An asset with that name or identifier is already registered in this location.");
      return;
    }

    const nextAssets = { ...assets, [activeType]: [...assets[activeType], newAsset] };
    try {
      saveManagedAssets(nextAssets);
      setAssets(nextAssets);
      setForms((current) => ({ ...current, [activeType]: INITIAL_FORMS[activeType] }));
      setMessage(`${ASSET_TYPES.find((type) => type.id === activeType)?.label.replace(/s$/, "")} added.`);
    } catch {
      setError("Could not save this asset in browser storage.");
    }
  };

  const activeAssets = assets[activeType];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-accent">Administration</p>
        <h2 className="mt-1 text-xl font-bold text-ink">Asset management</h2>
        <p className="mt-1 text-sm text-muted">Register campus locations and monitoring equipment.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist" aria-label="Asset type">
        {ASSET_TYPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeType === id}
            onClick={() => { setActiveType(id); setError(""); setMessage(""); }}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${activeType === id ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"}`}
          >
            <Icon size={16} />{label}<span className="rounded-full bg-canvas px-2 py-0.5 text-xs tabular-nums">{assets[id].length}</span>
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.85fr)]">
        <Card>
          <PanelHeader title={`ADD ${ASSET_TYPES.find((type) => type.id === activeType)?.label.toUpperCase().replace(/S$/, "")}`} />
          <form onSubmit={submitAsset} className="space-y-4 p-5">
            {activeType === "buildings" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Building name" required><TextInput required maxLength={100} value={forms.buildings.name} onChange={(event) => updateField("buildings", "name", event.target.value)} placeholder="e.g. College of Science" /></Field>
                  <Field label="Building code" required><TextInput required maxLength={30} value={forms.buildings.code} onChange={(event) => updateField("buildings", "code", event.target.value)} placeholder="e.g. COS-01" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Category" required><TextInput required maxLength={60} value={forms.buildings.category} onChange={(event) => updateField("buildings", "category", event.target.value)} placeholder="College, office, facility..." /></Field>
                  <Field label="Campus / site" required><TextInput required maxLength={80} value={forms.buildings.campus} onChange={(event) => updateField("buildings", "campus", event.target.value)} placeholder="e.g. Main Campus" /></Field>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-ink">Map coordinates <span className="font-normal text-muted">(optional)</span></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Latitude"><TextInput type="number" step="any" min="-90" max="90" value={forms.buildings.latitude} onChange={(event) => updateField("buildings", "latitude", event.target.value)} placeholder="11.66013" /></Field>
                    <Field label="Longitude"><TextInput type="number" step="any" min="-180" max="180" value={forms.buildings.longitude} onChange={(event) => updateField("buildings", "longitude", event.target.value)} placeholder="125.44311" /></Field>
                  </div>
                </div>
              </>
            )}

            {activeType === "tanks" && (
              <>
                <Field label="Building" required><SelectInput required value={forms.tanks.buildingId} onChange={(event) => updateField("tanks", "buildingId", event.target.value)}><option value="">Select a building</option>{buildingOptions.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</SelectInput></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tank name" required><TextInput required maxLength={80} value={forms.tanks.name} onChange={(event) => updateField("tanks", "name", event.target.value)} placeholder="e.g. Roof Tank" /></Field>
                  <Field label="Tank code" required><TextInput required maxLength={30} value={forms.tanks.code} onChange={(event) => updateField("tanks", "code", event.target.value)} placeholder="e.g. TANK-01" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Capacity (liters)" required><TextInput required type="number" min="1" step="1" value={forms.tanks.capacityL} onChange={(event) => updateField("tanks", "capacityL", event.target.value)} placeholder="10000" /></Field>
                  <Field label="Location" required><TextInput required maxLength={100} value={forms.tanks.location} onChange={(event) => updateField("tanks", "location", event.target.value)} placeholder="e.g. North roof" /></Field>
                </div>
                <Field label="Sensor / device ID" hint="Leave blank if the tank sensor is not installed yet."><TextInput maxLength={80} value={forms.tanks.deviceId} onChange={(event) => updateField("tanks", "deviceId", event.target.value)} placeholder="Sensor identifier" /></Field>
                <Field label="Low-level alert threshold (%)"><TextInput type="number" min="0" max="100" step="1" value={forms.tanks.lowLevelAlertPct} onChange={(event) => updateField("tanks", "lowLevelAlertPct", event.target.value)} placeholder="30" /></Field>
              </>
            )}

            {activeType === "sockets" && (
              <>
                <Field label="Building" required><SelectInput required value={forms.sockets.buildingId} onChange={(event) => updateField("sockets", "buildingId", event.target.value)}><option value="">Select a building</option>{buildingOptions.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</SelectInput></Field>
                <Field label="Room name / number" required hint="Choose a suggestion or enter a new room name."><TextInput required maxLength={80} list="socket-room-suggestions" value={forms.sockets.roomName} onChange={(event) => updateField("sockets", "roomName", event.target.value)} placeholder="e.g. Laboratory 3" /><datalist id="socket-room-suggestions">{roomOptions.filter((room) => room.buildingId === forms.sockets.buildingId).map((room) => <option key={room.id} value={room.name} />)}</datalist></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Socket label / number" required><TextInput required maxLength={50} value={forms.sockets.label} onChange={(event) => updateField("sockets", "label", event.target.value)} placeholder="e.g. Socket 01" /></Field>
                  <Field label="Device ID" hint="Optional until the device is commissioned."><TextInput maxLength={80} value={forms.sockets.deviceId} onChange={(event) => updateField("sockets", "deviceId", event.target.value)} placeholder="MAC address or serial number" /></Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Model"><TextInput maxLength={60} value={forms.sockets.model} onChange={(event) => updateField("sockets", "model", event.target.value)} placeholder="Socket model" /></Field>
                  <Field label="Electrical rating (watts)"><TextInput type="number" min="1" step="1" value={forms.sockets.electricalRatingW} onChange={(event) => updateField("sockets", "electricalRatingW", event.target.value)} placeholder="e.g. 2500" /></Field>
                </div>
                <Field label="Setup status" required><SelectInput required value={forms.sockets.status} onChange={(event) => updateField("sockets", "status", event.target.value)}><option>Pending setup</option><option>Active</option><option>Inactive</option></SelectInput></Field>
              </>
            )}

            {error && <p role="alert" className="text-sm font-medium text-crit">{error}</p>}
            {message && <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-accent"><Check size={15} />{message}</p>}
            <div className="flex justify-end border-t border-border pt-4">
              <button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#376A34]"><Plus size={16} />Add {ASSET_TYPES.find((type) => type.id === activeType)?.label.replace(/s$/, "")}</button>
            </div>
          </form>
        </Card>

        <Card>
          <PanelHeader title={`ADDED ${ASSET_TYPES.find((type) => type.id === activeType)?.label.toUpperCase()}`} right={<span className="text-xs font-medium text-muted">{activeAssets.length} total</span>} />
          {activeAssets.length ? (
            <ul className="divide-y divide-border px-5">
              {activeAssets.slice().reverse().map((asset) => (
                <li key={asset.id} className="flex items-start justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{getAssetTitle(activeType, asset, assets)}</div>
                    <div className="mt-1 text-xs text-muted">
                      {activeType === "buildings" && `${asset.code} · ${asset.category}`}
                      {activeType === "tanks" && `${asset.code} · ${Number(asset.capacityL).toLocaleString()} L${asset.deviceId ? " · Sensor linked" : " · Pending sensor"}`}
                      {activeType === "sockets" && `${asset.deviceId || "No device ID"} · ${asset.status}`}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#EAF3E8] px-2.5 py-1 text-[11px] font-semibold text-accent">
                    {activeType === "sockets" ? asset.status : "Registered"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted">No {ASSET_TYPES.find((type) => type.id === activeType)?.label.toLowerCase()} added yet.</div>
          )}
        </Card>
      </div>
      <p className="text-xs text-muted">Temporary setup: registrations are stored in this browser until the database is connected.</p>
    </div>
  );
}