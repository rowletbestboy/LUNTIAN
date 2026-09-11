import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, PanelHeader } from "./Card";

const data = [
  { t: "12 AM", kw: 120 },
  { t: "4 AM", kw: 95 },
  { t: "8 AM", kw: 210 },
  { t: "12 PM", kw: 340 },
  { t: "2 PM", kw: 438 },
  { t: "4 PM", kw: 300 },
  { t: "8 PM", kw: 190 },
  { t: "12 AM", kw: 140 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-semibold">Peak: {payload[0].value} kW</div>
      <div className="text-ice">{label}</div>
    </div>
  );
}

export default function ElectricityChart() {
  return (
    <Card className="flex-1">
      <PanelHeader
        title="CAMPUS ELECTRICITY CONSUMPTION"
        right={
          <select className="rounded-md border border-border bg-white px-2.5 py-1 text-xs text-ink">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        }
      />
      <div className="h-64 px-3 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E3E8F2" />
            <XAxis
              dataKey="t"
              tick={{ fill: "#8A93A8", fontSize: 11 }}
              axisLine={{ stroke: "#E3E8F2" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8A93A8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 600]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="kw"
              stroke="#2F6FED"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#2F6FED", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
