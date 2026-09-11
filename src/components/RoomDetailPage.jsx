import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, PanelHeader, StatCard, StatusPill } from "./Card";
import { Zap } from "lucide-react";

const chartData = [
  { t: "12 AM", kw: 12 },
  { t: "6 AM", kw: 40 },
  { t: "12 PM", kw: 58 },
  { t: "6 PM", kw: 55 },
  { t: "12 AM", kw: 18 },
];

const breakdown = [
  { name: "Air Conditioner", val: "42.1 kW", pct: "62%", color: "#2F6FED" },
  { name: "Lights", val: "8.3 kW", pct: "12%", color: "#E8A317" },
  { name: "Computers", val: "5.4 kW", pct: "8%", color: "#22A559" },
  { name: "Other", val: "11.5 kW", pct: "18%", color: "#C7CDDA" },
];

export default function RoomDetailPage({ room = "204" }) {
  return (
    <div>
      <div className="mb-4">
        <StatusPill status="High Usage" />
      </div>

      <div className="mb-5 grid grid-cols-4 gap-4">
        <StatCard icon={Zap} iconBg="#2F6FED" label="Current Power" value="67.3 kW" sub="" />
        <StatCard icon={Zap} iconBg="#22A559" label="Today's Consumption" value="328 kWh" sub="" />
        <StatCard icon={Zap} iconBg="#E8A317" label="This Month" value="6,842 kWh" sub="" />
        <StatCard icon={Zap} iconBg="#8B6FE8" label="Average Daily" value="228 kWh" sub="" />
      </div>

      <div className="flex gap-4">
        <Card className="flex-[1.4]">
          <PanelHeader title="CONSUMPTION (TODAY)" />
          <div className="h-64 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E8F2" />
                <XAxis dataKey="t" tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} />
                <YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="kw" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 3.5, fill: "#2F6FED", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="flex-1">
          <PanelHeader title="CONSUMPTION BREAKDOWN" />
          <div className="space-y-3 px-5 py-4">
            {breakdown.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="flex-1 text-ink">{b.name}</span>
                <span className="font-semibold text-ink">{b.val}</span>
                <span className="w-10 text-right text-xs text-muted">{b.pct}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
