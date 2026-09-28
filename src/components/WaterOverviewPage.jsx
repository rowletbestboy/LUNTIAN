import { useEffect, useState } from "react";
import { Droplet, Gauge, Waves } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";
import { loadLiveDevices } from "../data/liveDeviceStorage";

function formatLiters(value) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} L`;
}

export default function WaterOverviewPage({ userId, onNavigate }) {
  const [devices, setDevices] = useState([]);
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
      .then((result) => { if (isCurrent) { setDevices(result); setError(""); } })
      .catch((loadError) => { if (isCurrent) setError(loadError.message); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const reporting = devices.filter((device) => device.online
    && !device.telemetry?.water_sensor_fault
    && Number.isFinite(device.telemetry?.water_level_pct));
  const averageLevel = reporting.length
    ? reporting.reduce((sum, device) => sum + device.telemetry.water_level_pct, 0) / reporting.length
    : null;
  const knownCapacityDevices = reporting.filter((device) => Number(device.tank?.capacityL) > 0);
  const capacityLiters = knownCapacityDevices.reduce((sum, device) => sum + Number(device.tank.capacityL), 0);
  const storedLiters = knownCapacityDevices.reduce((sum, device) =>
    sum + Number(device.tank.capacityL) * device.telemetry.water_level_pct / 100, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Gauge} iconBg="#4A8445" label="Average live tank level" value={averageLevel === null ? "--" : `${averageLevel.toFixed(0)}%`} sub={`${reporting.length} reporting`} />
        <StatCard icon={Waves} iconBg="#31AFC5" label="Water stored" value={knownCapacityDevices.length ? formatLiters(storedLiters) : "--"} sub={knownCapacityDevices.length ? `of ${formatLiters(capacityLiters)} configured capacity` : "Register tank capacity to calculate"} />
        <StatCard icon={Droplet} iconBg="#E8A317" label="Water consumed today" value="--" sub="Not measured by the installed sensors" />
        <StatCard icon={Droplet} iconBg="#22A559" label="Live tank sensors" value={String(reporting.length)} sub={`${devices.length} registered devices`} />
      </div>

      {error && <p role="alert" className="text-sm text-crit">Could not load water telemetry: {error}</p>}

      <Card>
        <PanelHeader title="LIVE WATER LEVELS BY REGISTERED DEVICE" right={<span className="text-xs text-muted">Recent device readings</span>} />
        {isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-muted">Loading live water readings...</p>
        ) : reporting.length ? (
          <div className="divide-y divide-border px-5">
            {reporting.map((device) => {
              const level = device.telemetry.water_level_pct;
              const capacity = Number(device.tank?.capacityL) || null;
              const stored = capacity ? capacity * level / 100 : null;
              return (
                <div key={device.device_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(100px,1.3fr)_auto]">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{device.tank?.name || device.display_name}</div>
                    <div className="mt-1 truncate text-xs text-muted">{device.building_name || "Building not assigned"}{device.room_name ? ` · ${device.room_name}` : ""}</div>
                  </div>
                  <div className="col-span-2 h-2 overflow-hidden rounded-full bg-canvas sm:col-span-1">
                    <div className="h-full rounded-full bg-[#31AFC5]" style={{ width: `${Math.max(0, Math.min(100, level))}%` }} />
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold tabular-nums text-ink">{level.toFixed(0)}%</div>
                    <div className="text-xs text-muted">{stored === null ? "Capacity not set" : `${formatLiters(stored)} stored`}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-ink">No recent water-level readings</p>
            <p className="mt-1 text-sm text-muted">Connected and healthy ultrasonic sensors will appear here.</p>
          </div>
        )}
        <div className="flex justify-end border-t border-border px-5 py-4">
          <button type="button" onClick={() => onNavigate("tank-monitoring")} className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-canvas">Open tank monitoring</button>
        </div>
      </Card>
      {!userId && <p className="text-xs text-muted">Sign in to view telemetry associated with your registered devices.</p>}
    </div>
  );
}
