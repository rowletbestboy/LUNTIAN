import { Building2, Search, ChevronDown } from "lucide-react";
import { Card, StatusPill } from "./Card";

const buildings = [
  { name: "Engineering Building", kwh: "1,284 kWh", pct: "76%", status: "Normal" },
  { name: "Administration Building", kwh: "1,862 kWh", pct: "48%", status: "High Usage" },
  { name: "Library", kwh: "612 kWh", pct: "89%", status: "Normal" },
  { name: "Science Building", kwh: "932 kWh", pct: "94%", status: "Normal" },
  { name: "Cafeteria", kwh: "412 kWh", pct: "62%", status: "Normal" },
  { name: "Gymnasium", kwh: "368 kWh", pct: "71%", status: "Normal" },
];

export default function BuildingsPage({ onOpenBuilding }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search building..."
            className="w-full rounded-full border border-border bg-white py-2 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button className="flex items-center gap-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
          All Status <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {buildings.map((b) => (
          <button
            key={b.name}
            onClick={() => onOpenBuilding(b.name)}
            className="text-left"
          >
            <Card className="p-4 transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice">
                  <Building2 size={16} className="text-navy" />
                </div>
                <span className="font-semibold text-ink">{b.name}</span>
              </div>
              <div className="text-xs text-muted">&darr; {b.kwh}</div>
              <div className="mt-1 text-xl font-bold text-ink">{b.pct}</div>
              <div className="mt-2">
                <StatusPill status={b.status} />
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
