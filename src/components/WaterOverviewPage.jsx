import { Droplet } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";

const tanks = [
  { name: "College of Engineering", pct: 76, vol: "7,600 / 10,000 L", color: "#4A8445" },
  { name: "ESSU Infirmary", pct: 48, vol: "4,800 / 10,000 L", color: "#E8A317" },
  { name: "College of Agriculture and Fishery", pct: 89, vol: "8,900 / 10,000 L", color: "#22A559" },
  { name: "College of Science Building", pct: 94, vol: "9,400 / 10,000 L", color: "#22A559" },
  { name: "CCS IT Laboratory", pct: 62, vol: "6,300 / 10,000 L", color: "#E8A317" },
];

export default function WaterOverviewPage({ onNavigate }) {
  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard icon={Droplet} iconBg="#4A8445" label="Average Tank Level" value="76%" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Today's Consumption" value="12,430 L" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Total Capacity" value="150,000 L" sub="" />
        <StatCard icon={Droplet} iconBg="#4A8445" label="Buildings Monitored" value="17" sub="" />
      </div>

      <Card>
        <PanelHeader title="TANK LEVELS BY BUILDING" />
        <div className="space-y-4 px-5 py-5">
          {tanks.map((t) => (
            <div key={t.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:flex sm:gap-4">
              <span className="col-start-1 row-start-1 min-w-0 truncate text-sm text-ink sm:col-auto sm:row-auto sm:w-48 sm:shrink-0">{t.name}</span>
              <div className="col-span-2 col-start-1 row-start-2 h-2 w-full overflow-hidden rounded-full bg-canvas sm:col-auto sm:row-auto sm:w-auto sm:flex-1">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                />
              </div>
              <span className="col-start-2 row-start-1 text-right text-sm font-semibold text-ink sm:col-auto sm:row-auto">{t.pct}%</span>
              <span className="col-span-2 col-start-1 row-start-3 text-right text-xs text-muted sm:col-auto sm:row-auto sm:w-32">{t.vol}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center pb-5">
          <button onClick={() => onNavigate("tank-monitoring")} className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
            View All Tanks
          </button>
        </div>
      </Card>
    </div>
  );
}
