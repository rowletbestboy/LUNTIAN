import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, PanelHeader } from "./Card";

const daily = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const base = 10 + Math.sin(day / 3) * 5 + (day % 7 === 0 ? 8 : 0);
  return { day: day, kwh: Math.max(4, Math.round(base + Math.sin(day) * 2)) };
});

const stats = [
  { label: "Total Consumption", value: "54,231 kWh" },
  { label: "Average Daily", value: "1,749 kWh" },
  { label: "Highest Day", value: "2,345 kWh", sub: "May 15, 2024" },
  { label: "Average Day", value: "1,210 kWh", sub: "May 2, 2024" },
];

export default function ReportsPage() {
  return (
    <Card>
      <PanelHeader title="REPORTS & ANALYTICS" />
      <div className="flex flex-wrap gap-4 px-5 pt-4">
        <div>
          <div className="mb-1 text-xs text-muted">Report Type</div>
          <select className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
            <option>Electricity Consumption</option>
            <option>Water Consumption</option>
          </select>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted">Period</div>
          <select className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted invisible">Range</div>
          <div className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
            May 1 - 31, 2024
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 px-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-canvas p-3">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 text-lg font-bold text-ink">{s.value}</div>
            {s.sub && <div className="text-[10px] text-faint">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="px-5 pb-3 pt-5 text-sm font-bold text-ink">DAILY CONSUMPTION</div>
      <div className="h-56 px-3 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daily} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E3E8F2" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#8A93A8", fontSize: 10 }}
              axisLine={{ stroke: "#E3E8F2" }}
              tickLine={false}
              ticks={[1, 8, 15, 22, 31]}
              tickFormatter={(d) => `May ${d}`}
            />
            <YAxis tick={{ fill: "#8A93A8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => [`${v} kWh`, "Consumption"]} labelFormatter={(d) => `May ${d}`} />
            <Bar dataKey="kwh" fill="#4A8445" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end gap-2 px-5 pb-5">
        <button className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
          Export PDF
        </button>
        <button className="rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-ink hover:bg-canvas">
          Export Excel
        </button>
      </div>
    </Card>
  );
}
