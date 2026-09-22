import { Card, PanelHeader } from "./Card";

const tanks = [
  { name: "Engineering", pct: 76, vol: "7,600 / 10,000 L", color: "#A8CFA3" },
  { name: "Administration", pct: 48, vol: "4,800 / 10,000 L", color: "#F6D98A" },
  { name: "Library", pct: 89, vol: "8,900 / 10,000 L", color: "#8FD19E" },
  { name: "Science", pct: 94, vol: "9,400 / 10,000 L", color: "#8FD19E" },
  { name: "Cafeteria", pct: 62, vol: "6,300 / 10,000 L", color: "#F0C173" },
];

export default function WaterTankStatus() {
  return (
    <Card className="flex-1">
      <PanelHeader title="WATER TANK STATUS (TOP 5)" />
      <div className="grid grid-cols-5 gap-3 px-4 py-4">
        {tanks.map((t) => (
          <div
            key={t.name}
            className="flex flex-col items-center rounded-lg border border-border bg-canvas px-2 py-3"
          >
            <div className="mb-2 text-center text-[11px] font-semibold text-ink">
              {t.name}
            </div>
            <div className="mb-2 text-lg font-bold text-ink">{t.pct}%</div>
            <div className="relative h-16 w-6 overflow-hidden rounded-full border border-border bg-white">
              <div
                className="absolute bottom-0 w-full rounded-full transition-all"
                style={{ height: `${t.pct}%`, backgroundColor: t.color }}
              />
            </div>
            <div className="mt-2 text-center text-[9px] text-muted">
              {t.vol}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center pb-4">
        <button className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
          View All Tanks
        </button>
      </div>
    </Card>
  );
}
