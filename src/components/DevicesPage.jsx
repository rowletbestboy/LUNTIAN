import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, ChevronRight, DoorOpen, Plug } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings as campusBuildings } from "../data/buildings";
import { loadManagedAssets } from "../data/assetStorage";
import { loadLiveDevices } from "../data/liveDeviceStorage";

function getBuildingName(buildingId, buildingNames) {
  if (!buildingId) return "Location not assigned";
  if (buildingId.startsWith("existing:")) return buildingId.slice("existing:".length);
  return buildingNames.get(buildingId) || "Location not assigned";
}

export default function DevicesPage({ userId }) {
  const [assets, setAssets] = useState({ buildings: [], rooms: [], tanks: [], sockets: [] });
  const [devices, setDevices] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    if (!userId) {
      setIsLoading(false);
      return undefined;
    }
    const refresh = () => Promise.all([loadManagedAssets(userId), loadLiveDevices(userId)])
      .then(([loadedAssets, loadedDevices]) => {
        if (!isCurrent) return;
        setAssets(loadedAssets);
        setDevices(loadedDevices);
        setError("");
      })
      .catch((loadError) => { if (isCurrent) setError(loadError.message); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const buildingNames = useMemo(() => new Map([
    ...campusBuildings.map((building) => [`existing:${building.name}`, building.name]),
    ...assets.buildings.map((building) => [building.id, building.name]),
  ]), [assets.buildings]);
  const groups = useMemo(() => {
    const result = new Map();
    const ensureRoom = (buildingName, roomName) => {
      if (!result.has(buildingName)) result.set(buildingName, new Map());
      const rooms = result.get(buildingName);
      if (!rooms.has(roomName)) rooms.set(roomName, { sockets: [], controllers: [] });
      return rooms.get(roomName);
    };
    for (const socket of assets.sockets) {
      const buildingName = getBuildingName(socket.buildingId, buildingNames);
      ensureRoom(buildingName, socket.roomName || "Room not assigned").sockets.push(socket);
    }
    for (const device of devices) {
      const buildingName = device.building_name || "Location not assigned";
      ensureRoom(buildingName, device.room_name || "Room not assigned").controllers.push(device);
    }
    return result;
  }, [assets.sockets, buildingNames, devices]);

  const allBuildingNames = useMemo(() => [...new Set([
    ...campusBuildings.map((building) => building.name),
    ...assets.buildings.map((building) => building.name),
    ...groups.keys(),
  ])], [assets.buildings, groups]);
  const rooms = groups.get(selectedBuilding) || new Map();
  const selected = selectedRoom ? rooms.get(selectedRoom) : null;
  const activeSocketCount = selected?.sockets.filter((socket) => socket.status === "Active").length || 0;

  const back = () => {
    if (selectedRoom) setSelectedRoom(null);
    else setSelectedBuilding(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <button type="button" onClick={() => { setSelectedBuilding(null); setSelectedRoom(null); }} className={`font-semibold ${selectedBuilding ? "text-accent hover:underline" : "text-ink"}`}>Buildings</button>
          {selectedBuilding && <><ChevronRight size={14} className="text-muted" /><button type="button" onClick={() => setSelectedRoom(null)} className={`truncate font-semibold ${selectedRoom ? "text-accent hover:underline" : "text-ink"}`}>{selectedBuilding}</button></>}
          {selectedRoom && <><ChevronRight size={14} className="text-muted" /><span className="font-semibold text-ink">{selectedRoom}</span></>}
        </div>
        {(selectedBuilding || selectedRoom) && <button type="button" onClick={back} className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"><ArrowLeft size={15} />Back</button>}
      </div>

      {error && <p role="alert" className="text-sm text-crit">Could not load registered devices: {error}</p>}
      {!userId && <p className="text-sm text-muted">Sign in to see the devices registered to your account.</p>}

      {!selectedBuilding && (
        <Card>
          <PanelHeader title="CAMPUS BUILDINGS" />
          {isLoading ? <p className="p-8 text-center text-sm text-muted">Loading buildings and device registrations...</p> : (
            <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {allBuildingNames.map((name) => {
                const roomsInBuilding = groups.get(name)?.size || 0;
                const controllerCount = [...(groups.get(name)?.values() || [])].reduce((sum, room) => sum + room.controllers.length, 0);
                const socketCount = [...(groups.get(name)?.values() || [])].reduce((sum, room) => sum + room.sockets.length, 0);
                return <button key={name} type="button" onClick={() => setSelectedBuilding(name)} className="flex min-h-14 items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-accent/50 hover:bg-canvas"><Building2 size={17} className="shrink-0 text-accent" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{name}</span><span className="text-xs text-muted">{roomsInBuilding} registered rooms · {controllerCount} ESP32 · {socketCount} sockets</span></span><ChevronRight size={16} className="shrink-0 text-muted" /></button>;
              })}
            </div>
          )}
        </Card>
      )}

      {selectedBuilding && !selectedRoom && (
        <Card>
          <PanelHeader title="REGISTERED ROOMS" />
          <div className="divide-y divide-border px-5">
            {[...rooms.entries()].map(([name, room]) => <button key={name} type="button" onClick={() => setSelectedRoom(name)} className="flex w-full items-center gap-3 py-4 text-left hover:text-accent"><DoorOpen size={17} className="shrink-0 text-accent" /><span className="flex-1 text-sm font-medium text-ink">{name}</span><span className="text-xs text-muted">{room.sockets.filter((socket) => socket.status === "Active").length} active / {room.sockets.length} sockets · {room.controllers.length} ESP32</span><ChevronRight size={16} className="shrink-0 text-muted" /></button>)}
            {!rooms.size && <p className="py-8 text-center text-sm text-muted">No registered room or device locations for this building yet. Assign a building and room when registering assets or devices.</p>}
          </div>
        </Card>
      )}

      {selectedRoom && selected && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><div className="text-xs font-semibold uppercase tracking-wide text-muted">Active sockets</div><div className="mt-1 text-2xl font-bold text-ink">{activeSocketCount}</div><div className="text-xs text-muted">of {selected.sockets.length} registered</div></Card>
            <Card className="p-4"><div className="text-xs font-semibold uppercase tracking-wide text-muted">ESP32 controllers</div><div className="mt-1 text-2xl font-bold text-ink">{selected.controllers.filter((device) => device.online).length}</div><div className="text-xs text-muted">online of {selected.controllers.length} registered</div></Card>
            <Card className="p-4"><div className="text-xs font-semibold uppercase tracking-wide text-muted">Location</div><div className="mt-1 truncate text-sm font-bold text-ink">{selectedBuilding}</div><div className="text-xs text-muted">{selectedRoom}</div></Card>
          </div>
          <Card>
            <PanelHeader title="REGISTERED SOCKETS AND CONTROLLERS" />
            <div className="divide-y divide-border px-5">
              {selected.sockets.map((socket) => <div key={socket.id} className="flex items-center gap-3 py-4"><Plug size={17} className="shrink-0 text-accent" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-ink">{socket.label}</div><div className="text-xs text-muted">{socket.deviceId || "No controller ID linked"}{socket.model ? ` · ${socket.model}` : ""}</div></div><span className={`text-xs font-semibold ${socket.status === "Active" ? "text-ok" : "text-muted"}`}>{socket.status}</span></div>)}
              {selected.controllers.map((device) => <div key={device.device_id} className="flex items-center gap-3 py-4"><Building2 size={17} className="shrink-0 text-accent" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-ink">{device.display_name}</div><div className="text-xs text-muted">{device.device_id} · Temperature relay and water inlet</div></div><span className={`text-xs font-semibold ${device.online ? "text-ok" : "text-muted"}`}>{device.online ? "Online" : "Offline"}</span></div>)}
              {!selected.sockets.length && !selected.controllers.length && <p className="py-8 text-center text-sm text-muted">No devices registered in this room.</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
