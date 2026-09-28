import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Clock3, Filter, RotateCcw } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { loadLiveDevices } from "../data/liveDeviceStorage";

const SEVERITY_CLASS = {
  Critical: "bg-crit/10 text-crit",
  Warning: "bg-warn/10 text-warn",
  Info: "bg-ice text-accent",
};

function getLiveAlerts(devices) {
  return devices.flatMap((device) => {
    const telemetry = device.telemetry;
    const title = [device.building_name, device.room_name].filter(Boolean).join(" · ") || device.display_name;
    const time = telemetry ? new Date(telemetry.measured_at).toLocaleString() : "No reading received";
    if (!device.online) return [{ id: `${device.device_id}:offline`, title, description: "Device has no telemetry in the last 30 seconds", severity: "Warning", time }];
    return [
      ...(telemetry.temp_overheat ? [{ id: `${device.device_id}:overheat`, title, description: "Temperature safety cutoff is active", severity: "Critical", time }] : []),
      ...(telemetry.water_full ? [{ id: `${device.device_id}:tank-full`, title, description: "Tank-full cutoff is active; inlet relay is off", severity: "Info", time }] : []),
      ...(telemetry.dht_sensor_fault ? [{ id: `${device.device_id}:dht-fault`, title, description: "DHT22 reading failed; temperature relay is locked off", severity: "Warning", time }] : []),
      ...(telemetry.water_sensor_fault ? [{ id: `${device.device_id}:water-fault`, title, description: "Ultrasonic reading failed; water inlet is locked off", severity: "Warning", time }] : []),
    ];
  });
}

export default function LiveAlertsPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [statusFilter, setStatusFilter] = useState("Active");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    if (!userId) { setDevices([]); setIsLoading(false); return undefined; }
    const refresh = () => loadLiveDevices(userId)
      .then((result) => { if (isCurrent) { setDevices(result); setError(""); } })
      .catch((loadError) => { if (isCurrent) setError(loadError.message); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const alerts = useMemo(() => getLiveAlerts(devices).map((alert) => ({
    ...alert,
    status: statuses[alert.id] || "Open",
  })), [devices, statuses]);
  const activeCount = alerts.filter((alert) => !["Resolved", "Acknowledged"].includes(alert.status)).length;
  const criticalCount = alerts.filter((alert) => alert.severity === "Critical" && alert.status !== "Resolved").length;
  const filtered = alerts.filter((alert) => {
    const statusMatches = statusFilter === "All" || (statusFilter === "Active" ? alert.status !== "Resolved" : alert.status === statusFilter);
    return statusMatches && (severityFilter === "All severities" || alert.severity === severityFilter);
  });
  const setStatus = (id, status) => setStatuses((current) => ({ ...current, [id]: status }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-4"><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Active device alerts</div><div className="mt-1 text-2xl font-bold text-ink">{isLoading ? "--" : activeCount}</div></div><AlertTriangle size={20} className="text-warn" /></Card>
        <Card className="flex items-center justify-between p-4"><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Critical unresolved</div><div className="mt-1 text-2xl font-bold text-ink">{isLoading ? "--" : criticalCount}</div></div><span className="h-3 w-3 rounded-full bg-crit" /></Card>
      </div>
      {error && <p role="alert" className="text-sm text-crit">Could not load alert data: {error}</p>}
      <Card>
        <PanelHeader title="LIVE DEVICE ALERT QUEUE" right={<Filter size={15} className="text-muted" />} />
        <div className="flex flex-wrap gap-3 border-b border-border px-5 py-4">
          <label className="text-xs font-medium text-muted">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ml-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-ink"><option>Active</option><option>All</option><option>Open</option><option>Acknowledged</option><option>Snoozed</option><option>Resolved</option></select></label>
          <label className="text-xs font-medium text-muted">Severity<select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="ml-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-ink"><option>All severities</option><option>Critical</option><option>Warning</option><option>Info</option></select></label>
        </div>
        <div className="divide-y divide-border px-5">
          {isLoading ? <p className="py-8 text-center text-sm text-muted">Checking current device state...</p> : !filtered.length ? <p className="py-8 text-center text-sm text-muted">No live device alerts match these filters.</p> : filtered.map((alert) => (
            <article key={alert.id} className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center ${alert.status === "Resolved" ? "opacity-60" : ""}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${SEVERITY_CLASS[alert.severity]}`}><AlertTriangle size={14} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-ink">{alert.title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_CLASS[alert.severity]}`}>{alert.severity}</span><span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">{alert.status}</span></div>
                <p className="mt-1 text-xs text-muted">{alert.description}</p>
                <p className="text-[10px] text-faint">Reading: {alert.time}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {alert.status !== "Resolved" && alert.status !== "Acknowledged" && <button type="button" onClick={() => setStatus(alert.id, "Acknowledged")} className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><Check size={13} />Acknowledge</button>}
                {alert.status !== "Resolved" && alert.status !== "Snoozed" && <button type="button" onClick={() => setStatus(alert.id, "Snoozed")} className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><Clock3 size={13} />Snooze</button>}
                {alert.status === "Snoozed" && <button type="button" onClick={() => setStatus(alert.id, "Open")} className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><RotateCcw size={13} />Restore</button>}
                {alert.status !== "Resolved" && <button type="button" onClick={() => setStatus(alert.id, "Resolved")} className="h-8 rounded-md bg-accent px-2.5 text-xs font-semibold text-white hover:bg-[#376A34]">Resolve</button>}
              </div>
            </article>
          ))}
        </div>
      </Card>
      <p className="text-xs text-muted">Alert status actions are in this browser session only. The active conditions are recalculated from current device telemetry.</p>
    </div>
  );
}
