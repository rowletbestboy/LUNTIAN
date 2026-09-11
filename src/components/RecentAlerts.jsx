import { AlertTriangle } from "lucide-react";
import { Card, PanelHeader } from "./Card";

const alerts = [
  {
    title: "Engineering Building",
    desc: "Electricity usage is 28% higher than normal",
    time: "10 min ago",
    level: "crit",
  },
  {
    title: "Administration Building",
    desc: "Water consumption is unusually high",
    time: "25 min ago",
    level: "warn",
  },
  {
    title: "Room 204 (Eng. Bldg.)",
    desc: "Aircon is ON outside scheduled time",
    time: "1 hr ago",
    level: "warn",
  },
  {
    title: "Science Building",
    desc: "Water sensor is offline",
    time: "2 hrs ago",
    level: "offline",
  },
];

const levelColor = {
  crit: "bg-crit/10 text-crit",
  warn: "bg-warn/10 text-warn",
  offline: "bg-faint/20 text-faint",
};

export default function RecentAlerts() {
  return (
    <Card className="w-full max-w-sm">
      <PanelHeader title="RECENT ALERTS" />
      <div className="divide-y divide-border px-4 py-2">
        {alerts.map((a) => (
          <div key={a.title} className="flex gap-3 py-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${levelColor[a.level]}`}
            >
              <AlertTriangle size={13} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">{a.title}</div>
              <div className="truncate text-xs text-muted">{a.desc}</div>
              <div className="text-[10px] text-faint">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
