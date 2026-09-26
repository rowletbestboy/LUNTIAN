import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, PanelHeader } from "./Card";

const data = [
  { name: "College of Engineering", value: 42, kwh: "1,032 kWh", color: "#4A8445" },
  { name: "Canuctan Hall", value: 23, kwh: "4,265 kWh", color: "#E8A317" },
  { name: "College of Agriculture and Fishery", value: 17, kwh: "1,715 kWh", color: "#22A559" },
  { name: "College of Science Building", value: 10, kwh: "1,862 kWh", color: "#8B6FE8" },
  { name: "College of Criminal Justice Education", value: 8, kwh: "1,486 kWh", color: "#C7CDDA" },
];

export default function BreakdownDonut() {
  return (
    <Card className="w-full max-w-sm">
      <PanelHeader title="CONSUMPTION BREAKDOWN (TODAY)" />
      <div className="flex items-center gap-3 px-3 py-4 sm:gap-4 sm:px-4">
        <div className="h-28 w-28 shrink-0 sm:h-40 sm:w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={35}
                outerRadius={51}
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
        <div className="min-w-0 flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="min-w-0 flex-1 truncate text-ink">{d.name}</span>
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
