import { useState } from "react";
import { Activity, Gauge, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PanelHeader, StatCard } from "./Card";
import { buildings } from "../data/buildings";

const outletUsage = [
  { outlet: "Aircon · Room 204", location: "College of Engineering", kwh: 328, demand: "3.2 kW" },
  { outlet: "Lab workstation bank", location: "CCS IT Laboratory", kwh: 286, demand: "2.8 kW" },
  { outlet: "Aircon · Room 101", location: "Administration Building", kwh: 241, demand: "2.4 kW" },
  { outlet: "Kitchen equipment", location: "College of Hospitality Management", kwh: 219, demand: "2.1 kW" },
  { outlet: "Aircon · Room 205", location: "College of Engineering", kwh: 198, demand: "1.9 kW" },
];

const weeklyTrends = [
  { day: "Mon", kwh: 1480 }, { day: "Tue", kwh: 1620 }, { day: "Wed", kwh: 1535 },
  { day: "Thu", kwh: 1740 }, { day: "Fri", kwh: 1690 }, { day: "Sat", kwh: 980 }, { day: "Sun", kwh: 850 },
];

export default function AnalyticsPage() {
  const [building, setBuilding] = useState("All buildings");
  const [period, setPeriod] = useState("This week");
  const campusDailyKwh = buildings.reduce(
    (total, item) => total + Number(item.kwh.replace(/[^\d]/g, "")),
    0
  );
  const visibleOutlets = building === "All buildings"
    ? outletUsage
    : outletUsage.filter((outlet) => outlet.location === building);
  const selectedBuilding = buildings.find((item) => item.name === building);
  const factor = selectedBuilding
    ? Number(selectedBuilding.kwh.replace(/[^\d]/g, "")) / campusDailyKwh
    : 1;
  const sourceTrend = period === "This week"
    ? weeklyTrends
    : Array.from({ length: 30 }, (_, index) => {
        const day = index + 1;
        return { day: `Day ${day}`, kwh: Math.round(1450 + Math.sin(day / 3) * 190 + (day % 7 === 0 ? 120 : 0)) };
      });
  const chartData = sourceTrend.map((entry) => ({ ...entry, kwh: Math.round(entry.kwh * factor) }));
  const total = chartData.reduce((sum, entry) => sum + entry.kwh, 0);
  const peak = Math.max(...chartData.map((entry) => entry.kwh));
  const mean = Math.round(total / chartData.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="text-xs font-medium text-muted">Building<select value={building} onChange={(event) => setBuilding(event.target.value)} className="mt-1 block min-w-56 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>All buildings</option>{buildings.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>This week</option><option>This month</option></select></label>
        </div>
        <span className="text-xs text-muted">Illustrative outlet telemetry</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Zap} iconBg="#E8A317" label="Energy consumed" value={`${total.toLocaleString()} kWh`} sub={period} />
        <StatCard icon={Gauge} iconBg="#4A8445" label="Highest daily use" value={`${peak.toLocaleString()} kWh`} sub="Peak day in selected period" />
        <StatCard icon={Activity} iconBg="#31AFC5" label="Daily average" value={`${mean.toLocaleString()} kWh`} sub={building} />
      </div>

      <Card>
        <PanelHeader title="DAILY ELECTRICITY CONSUMPTION" right={<span className="text-xs text-muted">kWh per day</span>} />
        <div className="h-72 px-3 py-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 12, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E3E8F2" />
              <XAxis dataKey="day" tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} />
              <YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${value.toLocaleString()} kWh`, "Consumption"]} />
              <Bar dataKey="kwh" fill="#4A8445" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <PanelHeader title="HIGHEST-CONSUMING OUTLETS" right={<span className="text-xs text-muted">Today · sample data</span>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-border text-left text-xs text-muted"><th className="px-5 py-3 font-medium">Outlet</th><th className="px-5 py-3 font-medium">Building</th><th className="px-5 py-3 text-right font-medium">Energy</th><th className="px-5 py-3 text-right font-medium">Current demand</th></tr></thead>
            <tbody className="divide-y divide-border">{visibleOutlets.length ? visibleOutlets.map((outlet) => <tr key={outlet.outlet}><td className="px-5 py-3 font-medium text-ink">{outlet.outlet}</td><td className="px-5 py-3 text-muted">{outlet.location}</td><td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{outlet.kwh} kWh</td><td className="px-5 py-3 text-right tabular-nums text-ink">{outlet.demand}</td></tr>) : <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">No sample outlet data for this building.</td></tr>}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
