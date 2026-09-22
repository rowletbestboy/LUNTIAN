import { Droplet } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";

const tanks = [
  { name: "Engineering Building", pct: 76, vol: "7,600 / 10,000 L", color: "#4A8445" },
  { name: "Administration Building", pct: 48, vol: "4,800 / 10,000 L", color: "#E8A317" },
  { name: "Library", pct: 89, vol: "8,900 / 10,000 L", color: "#22A559" },
  { name: "Science Building", pct: 94, vol: "9,400 / 10,000 L", color: "#22A559" },
  { name: "Cafeteria", pct: 62, vol: "6,300 / 10,000 L", color: "#E8A317" },
];

export default function WaterOverviewPage() {
  return (
    <div>
      <div className="mb-5 grid grid-cols-4 gap-4">
        <StatCard icon={Droplet} iconBg="#4A8445" label="Average Tank Level" value="76%" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Today's Consumption" value="12,430 L" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Total Capacity" value="150,000 L" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Buildings Monitored" value="12" sub="" />
      </div>

      <Card>
        <PanelHeader title="TANK LEVELS BY BUILDING" />
        <div className="space-y-4 px-5 py-5">
          {tanks.map((t) => (
            <div key={t.name} className="flex items-center gap-4">
              <span className="w-48 shrink-0 text-sm text-ink">{t.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                />
              </div>
              <span className="w-10 text-right text-sm font-semibold text-ink">{t.pct}%</span>
              <span className="w-32 text-right text-xs text-muted">{t.vol}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center pb-5">
          <button className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
            View All Tanks
          </button>
        </div>
      </Card>
    </div>
  );
}
