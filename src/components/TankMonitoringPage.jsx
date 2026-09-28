import { useEffect, useMemo, useState } from "react";
import { Building2, Droplet, Gauge, Waves } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";
import { buildings as campusBuildings } from "../data/buildings";
import { loadLiveDevices } from "../data/liveDeviceStorage";

function formatLiters(value) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} L`;
}

function levelColor(level) {
  if (level < 30) return "#D85A4A";
  if (level < 55) return "#E8A317";
  return "#31AFC5";
}

export default function TankMonitoringPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    if (!userId) {
      setDevices([]);
      setIsLoading(false);
      return undefined;
    }
    const refresh = () => loadLiveDevices(userId)
      .then((result) => {
        if (!isCurrent) return;
        setDevices(result);
        setSelectedBuilding((current) => current || result.find((device) => device.building_name)?.building_name || campusBuildings[0]?.name || "");
        setError("");
      })
      .catch((loadError) => { if (isCurrent) setError(loadError.message); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const buildingNames = useMemo(() => [...new Set([
    ...campusBuildings.map((building) => building.name),
    ...devices.map((device) => device.building_name).filter(Boolean),
    ...(devices.some((device) => !device.building_name) ? ["Location not assigned"] : []),
  ])], [devices]);
  const buildingDevices = devices.filter((device) =>
    selectedBuilding === "Location not assigned" ? !device.building_name : device.building_name === selectedBuilding
  );
  const reporting = buildingDevices.filter((device) => device.online
    && !device.telemetry?.water_sensor_fault
    && Number.isFinite(device.telemetry?.water_level_pct));
  const averageLevel = reporting.length
    ? reporting.reduce((sum, device) => sum + device.telemetry.water_level_pct, 0) / reporting.length
    : null;
  const capacityDevices = reporting.filter((device) => Number(device.tank?.capacityL) > 0);
  const totalCapacity = capacityDevices.reduce((sum, device) => sum + Number(device.tank.capacityL), 0);
  const stored = capacityDevices.reduce((sum, device) =>
    sum + Number(device.tank.capacityL) * device.telemetry.water_level_pct / 100, 0);

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="self-start overflow-hidden">
        <PanelHeader title="CAMPUS BUILDINGS" />
        <div className="max-h-[36vh] space-y-1 overflow-y-auto p-3 sm:max-h-[42vh] xl:max-h-[680px]">
          {buildingNames.map((name) => {
            const count = devices.filter((device) => name === "Location not assigned" ? !device.building_name : device.building_name === name).length;
            return (
              <button key={name} type="button" onClick={() => setSelectedBuilding(name)} aria-pressed={selectedBuilding === name} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selectedBuilding === name ? "bg-ice ring-1 ring-accent/25" : "hover:bg-canvas"}`}>
                <Building2 size={17} className="shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
                <span className="text-xs tabular-nums text-muted">{count}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <section className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Live water monitoring</div>
            <h2 className="mt-1 text-xl font-bold text-ink">{selectedBuilding || "Select a building"}</h2>
          </div>
          <span className="text-sm text-muted">{buildingDevices.length} registered {buildingDevices.length === 1 ? "device" : "devices"}</span>
        </div>

        {error && <p role="alert" className="text-sm text-crit">Could not load tank data: {error}</p>}
        {!userId && <p className="text-sm text-muted">Sign in to view registered devices and their telemetry.</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard icon={Gauge} iconBg={averageLevel === null ? "#7B8794" : levelColor(averageLevel)} label="Average live level" value={averageLevel === null ? "--" : `${averageLevel.toFixed(0)}%`} sub={`${reporting.length} reporting tanks`} />
          <StatCard icon={Droplet} iconBg="#31AFC5" label="Water stored" value={capacityDevices.length ? formatLiters(stored) : "--"} sub={capacityDevices.length ? `of ${formatLiters(totalCapacity)} configured capacity` : "Register capacity to estimate liters"} />
          <StatCard icon={Waves} iconBg="#4A8445" label="Consumption today" value="--" sub="Requires a flow meter" />
        </div>

        {isLoading ? (
          <Card className="p-8 text-center text-sm text-muted">Loading device telemetry...</Card>
        ) : buildingDevices.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-ink">No device registered at this building</p>
            <p className="mt-1 text-sm text-muted">Register and assign a tank sensor to this building to show its live level here.</p>
          </Card>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {buildingDevices.map((device) => {
              const level = device.telemetry?.water_level_pct;
              const hasLevel = device.online && !device.telemetry?.water_sensor_fault && Number.isFinite(level);
              const color = hasLevel ? levelColor(level) : "#AAB3BC";
              const capacity = Number(device.tank?.capacityL) || null;
              const volume = hasLevel && capacity ? capacity * level / 100 : null;
              return (
                <Card key={device.device_id} className="overflow-hidden">
                  <PanelHeader title={device.tank?.name || device.display_name} right={<span className={`text-xs font-semibold ${device.online ? "text-ok" : "text-muted"}`}>{device.online ? "Online" : "Offline"}</span>} />
                  <div className="px-5 pb-5 pt-2">
                    <p className="truncate text-xs text-muted">{device.room_name ? `${device.room_name} · ` : ""}{device.device_id}</p>
                    <div className="mt-4 flex items-center justify-center gap-7 rounded-lg bg-canvas/70 px-4 py-5">
                      <div className="flex flex-col items-center">
                        <div className="mb-1 h-2 w-24 rounded-t-md bg-[#6E8B98]" />
                        <div role="img" aria-label={hasLevel ? `${device.display_name}: ${level.toFixed(0)} percent full` : `${device.display_name}: no current level reading`} className="relative h-48 w-24 overflow-hidden rounded-b-xl rounded-t-sm border-2 border-[#6E8B98] bg-white shadow-inner">
                          {hasLevel && <div className="absolute inset-x-0 bottom-0 transition-[height] duration-500" style={{ height: `${Math.max(0, Math.min(100, level))}%`, backgroundColor: color }} />}
                          <div className="absolute inset-0 flex flex-col justify-between py-2">
                            {[75, 50, 25].map((mark) => <div key={mark} className="flex items-center gap-1"><span className="h-px w-2 bg-[#6E8B98]" /><span className="rounded bg-white/80 px-0.5 text-[8px] font-medium text-ink">{mark}%</span></div>)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm font-semibold tabular-nums text-ink">{hasLevel ? `${level.toFixed(0)}% full` : "No live level"}</div>
                        <div className="text-xs text-muted">{volume === null ? "Volume unavailable" : `${formatLiters(volume)} stored`}</div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div><div className="text-xs text-muted">Temperature</div><div className="mt-0.5 font-semibold tabular-nums text-ink">{device.telemetry?.temperature_c == null ? "--" : `${device.telemetry.temperature_c.toFixed(1)} °C`}</div></div>
                        <div><div className="text-xs text-muted">Humidity</div><div className="mt-0.5 font-semibold tabular-nums text-ink">{device.telemetry?.humidity_pct == null ? "--" : `${device.telemetry.humidity_pct.toFixed(1)}%`}</div></div>
                        <div><div className="text-xs text-muted">Distance to water</div><div className="mt-0.5 font-semibold tabular-nums text-ink">{device.telemetry?.water_distance_cm == null ? "--" : `${device.telemetry.water_distance_cm.toFixed(1)} cm`}</div></div>
                        <div><div className="text-xs text-muted">Configured capacity</div><div className="mt-0.5 font-semibold tabular-nums text-ink">{capacity ? formatLiters(capacity) : "Not registered"}</div></div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted">
                      <span>{device.telemetry ? `Last reading ${new Date(device.telemetry.measured_at).toLocaleString()}` : "Waiting for first reading"}</span>
                      {device.telemetry?.water_sensor_fault && <span className="font-semibold text-warn">Ultrasonic sensor fault</span>}
                      {device.telemetry?.water_full && <span className="font-semibold text-warn">Tank-full cutoff active</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}