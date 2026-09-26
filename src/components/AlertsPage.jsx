import { useState } from "react";
import { AlertTriangle, Check, Clock3, Filter, RotateCcw } from "lucide-react";
import { Card, PanelHeader } from "./Card";

const initialAlerts = [
  { id: 1, title: "College of Engineering", desc: "Electricity usage is 28% higher than normal", time: "10 min ago", level: "Critical", status: "Open" },
  { id: 2, title: "ESSU Infirmary", desc: "Water consumption is unusually high", time: "25 min ago", level: "Warning", status: "Open" },
  { id: 3, title: "College of Engineering · Room 204", desc: "Aircon is on outside scheduled time", time: "1 hr ago", level: "Warning", status: "Acknowledged" },
  { id: 4, title: "College of Science Building", desc: "Water sensor is offline", time: "2 hrs ago", level: "Info", status: "Open" },
  { id: 5, title: "CCS IT Laboratory", desc: "Smart outlet not responding", time: "3 hrs ago", level: "Critical", status: "Resolved" },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [statusFilter, setStatusFilter] = useState("All active");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const activeCount = alerts.filter((alert) => alert.status !== "Resolved").length;
  const criticalCount = alerts.filter((alert) => alert.level === "Critical" && alert.status !== "Resolved").length;
  const filtered = alerts.filter((alert) => {
    const matchesStatus = statusFilter === "All active"
      ? alert.status !== "Resolved"
      : statusFilter === "All"
        ? true
        : alert.status === statusFilter;
    return matchesStatus && (severityFilter === "All severities" || alert.level === severityFilter);
  });

  const updateStatus = (id, status) => {
    setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status } : alert));
  };

  const severityStyle = {
    Critical: "bg-crit/10 text-crit",
    Warning: "bg-warn/10 text-warn",
    Info: "bg-ice text-accent",
  };

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center justify-between p-4"><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Active alerts</div><div className="mt-1 text-2xl font-bold text-ink">{activeCount}</div></div><AlertTriangle size={20} className="text-warn" /></Card>
        <Card className="flex items-center justify-between p-4"><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Critical unresolved</div><div className="mt-1 text-2xl font-bold text-ink">{criticalCount}</div></div><span className="h-3 w-3 rounded-full bg-crit" /></Card>
      </div>

      <Card>
        <PanelHeader title="ALERT QUEUE" right={<Filter size={15} className="text-muted" />} />
        <div className="flex flex-wrap gap-3 border-b border-border px-5 py-4">
          <label className="text-xs font-medium text-muted">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="ml-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-ink"><option>All active</option><option>All</option><option>Open</option><option>Acknowledged</option><option>Snoozed</option><option>Resolved</option></select></label>
          <label className="text-xs font-medium text-muted">Severity<select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="ml-2 rounded-md border border-border bg-white px-2.5 py-1.5 text-xs text-ink"><option>All severities</option><option>Critical</option><option>Warning</option><option>Info</option></select></label>
        </div>
        <div className="divide-y divide-border px-5">
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted">No alerts match these filters.</div>
          )}
          {filtered.map((a) => (
            <article key={a.id} className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center ${a.status === "Resolved" ? "opacity-60" : ""}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${severityStyle[a.level]}`}>
                <AlertTriangle size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><div className="text-sm font-semibold text-ink">{a.title}</div><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${severityStyle[a.level]}`}>{a.level}</span><span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">{a.status}</span></div>
                <div className="mt-1 text-xs text-muted">{a.desc}</div>
                {a.status === "Snoozed" && <div className="mt-1 text-xs text-warn">Snoozed for 1 hour</div>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <span className="mr-1 text-xs text-faint">{a.time}</span>
                {a.status !== "Resolved" && a.status !== "Acknowledged" && <button type="button" onClick={() => updateStatus(a.id, "Acknowledged")} title="Acknowledge alert" className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><Check size={13} /> Acknowledge</button>}
                {a.status !== "Resolved" && a.status !== "Snoozed" && <button type="button" onClick={() => updateStatus(a.id, "Snoozed")} title="Snooze for one hour" className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><Clock3 size={13} /> Snooze</button>}
                {a.status === "Snoozed" && <button type="button" onClick={() => updateStatus(a.id, "Open")} title="Restore alert" className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink hover:bg-canvas"><RotateCcw size={13} /> Restore</button>}
                {a.status !== "Resolved" && <button type="button" onClick={() => updateStatus(a.id, "Resolved")} className="h-8 rounded-md bg-accent px-2.5 text-xs font-semibold text-white hover:bg-[#376A34]">Resolve</button>}
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
