import { useEffect, useState } from "react";
import { Activity, Droplet, Plug, TriangleAlert, Waves, Zap } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";
import { loadLiveDevices } from "../data/liveDeviceStorage";
import DemoDevicePanel from "./DemoDevicePanel";

const REFRESH_MS = 5000;

export default function LiveDashboardPage({ userId }) {
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
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const reporting = devices.filter((device) => device.online);
  const waterReadings = reporting.filter((device) => !device.telemetry.water_sensor_fault
    && Number.isFinite(device.telemetry.water_level_pct));
  const avgWater = waterReadings.length
    ? waterReadings.reduce((sum, device) => sum + device.telemetry.water_level_pct, 0) / waterReadings.length
    : null;
  const socketsOn = reporting.reduce((sum, device) =>
    sum + Number(device.telemetry.temp_relay_on) + Number(device.telemetry.water_relay_on), 0);
  const activeAlerts = devices.flatMap((device) => {
    const telemetry = device.telemetry;
    const location = [device.building_name, device.room_name].filter(Boolean).join(" · ") || device.display_name;
    if (!telemetry || !device.online) return [{ id: `${device.device_id}:offline`, title: location, detail: "Device has no recent reading", severity: "Warning" }];
    return [
      ...(telemetry.temp_overheat ? [{ id: `${device.device_id}:heat`, title: location, detail: "Temperature safety cutoff active", severity: "Critical" }] : []),
      ...(telemetry.water_full ? [{ id: `${device.device_id}:full`, title: location, detail: "Tank full; inlet relay cut off", severity: "Info" }] : []),
      ...(telemetry.dht_sensor_fault ? [{ id: `${device.device_id}:dht`, title: location, detail: "DHT22 sensor fault", severity: "Warning" }] : []),
      ...(telemetry.water_sensor_fault ? [{ id: `${device.device_id}:ultrasonic`, title: location, detail: "Ultrasonic sensor fault", severity: "Warning" }] : []),
    ];
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Zap} iconBg="#E8A317" label="Campus electricity" value="--" sub="No electricity meter connected" />
        <StatCard icon={Droplet} iconBg="#31AFC5" label="Average live tank level" value={avgWater === null ? "--" : `${avgWater.toFixed(0)}%`} sub={`${waterReadings.length} reporting tanks`} />
        <StatCard icon={Waves} iconBg="#4A8445" label="Water consumed" value="--" sub="Requires a flow meter" />
        <StatCard icon={Plug} iconBg="#22A559" label="Relays energized" value={String(socketsOn)} sub={`${reporting.length} online controllers`} />
        <StatCard icon={TriangleAlert} iconBg={activeAlerts.length ? "#D85A4A" : "#4A8445"} label="Device alerts" value={String(activeAlerts.length)} sub="Derived from latest telemetry" />
      </div>

      {!userId && <p className="text-sm text-muted">Sign in to view telemetry for your registered devices.</p>}
      {error && <p role="alert" className="text-sm text-crit">Could not load live dashboard data: {error}</p>}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <DemoDevicePanel userId={userId} />
        <Card className="overflow-hidden">
          <PanelHeader title="CURRENT DEVICE ALERTS" right={<Activity size={15} className="text-muted" />} />
          {isLoading ? <p className="px-5 py-8 text-center text-sm text-muted">Loading latest readings...</p> : activeAlerts.length ? (
            <div className="divide-y divide-border px-5">
              {activeAlerts.slice(0, 6).map((alert) => <div key={alert.id} className="flex gap-3 py-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${alert.severity === "Critical" ? "bg-crit" : alert.severity === "Warning" ? "bg-warn" : "bg-accent"}`} /><div className="min-w-0"><div className="truncate text-sm font-semibold text-ink">{alert.title}</div><div className="text-xs text-muted">{alert.detail}</div></div></div>)}
            </div>
          ) : <p className="px-5 py-8 text-center text-sm text-muted">No current device alerts.</p>}
          <div className="border-t border-border px-5 py-3 text-xs text-muted">Alerts reflect current device state; they are not yet stored as an acknowledgement history.</div>
        </Card>
      </div>
    </div>
  );
}