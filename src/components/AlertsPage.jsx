import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, PanelHeader } from "./Card";

const initialAlerts = [
  { title: "Engineering Building", desc: "Electricity usage is 28% higher than normal", time: "10 min ago", level: "Critical", read: false },
  { title: "Administration Building", desc: "Water consumption is unusually high", time: "25 min ago", level: "Warning", read: false },
  { title: "Room 204 (Eng. Bldg.)", desc: "Aircon is ON outside scheduled time", time: "1 hr ago", level: "Warning", read: false },
  { title: "Science Building", desc: "Water sensor is offline", time: "2 hrs ago", level: "Info", read: false },
  { title: "Fitness Center", desc: "Smart outlet not responding", time: "3 hrs ago", level: "Critical", read: false },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [tab, setTab] = useState("All");

  const counts = {
    All: alerts.length,
    Critical: alerts.filter((a) => a.level === "Critical").length,
    Warning: alerts.filter((a) => a.level === "Warning").length,
    Info: alerts.filter((a) => a.level === "Info").length,
  };

  const filtered = tab === "All" ? alerts : alerts.filter((a) => a.level === tab);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
          className="text-sm font-medium text-accent hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <Card>
        <PanelHeader title="ALERTS" />
        <div className="flex gap-6 border-b border-border px-5 pt-3">
          {Object.entries(counts).map(([t, c]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-2 text-sm ${
                tab === t ? "border-accent font-semibold text-accent" : "border-transparent text-muted"
              }`}
            >
              {t} ({c})
            </button>
          ))}
        </div>
        <div className="divide-y divide-border px-5">
          {filtered.length === 0 && (
            <div className="py-6 text-center text-muted">Nothing here.</div>
          )}
          {filtered.map((a) => (
            <div key={a.title + a.time} className={`flex gap-3 py-4 ${a.read ? "opacity-50" : ""}`}>
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crit/10 text-crit">
                <AlertTriangle size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink">{a.title}</div>
                <div className="text-xs text-muted">{a.desc}</div>
              </div>
              <div className="shrink-0 text-xs text-faint">{a.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
