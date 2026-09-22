import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, PanelHeader } from "./Card";

const data = [
  { name: "Engineering", value: 42, kwh: "1,032 kWh", color: "#4A8445" },
  { name: "Administration", value: 23, kwh: "4,265 kWh", color: "#E8A317" },
  { name: "Library", value: 17, kwh: "1,715 kWh", color: "#22A559" },
  { name: "Science", value: 10, kwh: "1,862 kWh", color: "#8B6FE8" },
  { name: "Others", value: 8, kwh: "1,486 kWh", color: "#C7CDDA" },
];

export default function BreakdownDonut() {
  return (
    <Card className="w-full max-w-sm">
      <PanelHeader title="CONSUMPTION BREAKDOWN (TODAY)" />
      <div className="flex items-center gap-4 px-4 py-4">
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={1}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="flex-1 text-ink">{d.name}</span>
              <span className="font-semibold text-ink">{d.value}%</span>
              <span className="w-16 text-right text-[10px] text-muted">
                {d.kwh}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
