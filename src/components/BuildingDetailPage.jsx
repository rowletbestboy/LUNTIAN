import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, PanelHeader } from "./Card";
import { buildings, getBuildingEmissionsKg } from "../data/buildings";

const chartData = [
  { t: "12 AM", kw: 30 },
  { t: "4 AM", kw: 22 },
  { t: "8 AM", kw: 55 },
  { t: "12 PM", kw: 78 },
  { t: "4 PM", kw: 65 },
  { t: "8 PM", kw: 50 },
  { t: "12 AM", kw: 28 },
];

export default function BuildingDetailPage({ buildingName }) {
  const building = buildings.find((item) => item.name === buildingName);

  return (
    <Card>
      <PanelHeader title="TOTAL ELECTRICITY CONSUMPTION" />
      <div className="px-5 pt-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Today</div>
        <div className="mt-1 text-3xl font-bold text-ink">{building?.kwh || "No data"}</div>
        {building && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">Carbon emissions today</div>
            <div className="mt-1 text-xl font-bold text-ink">
              {getBuildingEmissionsKg(building).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e
            </div>
            <div className="mt-0.5 text-xs text-muted">Calculated at 0.7 kg CO₂e per kWh</div>
          </div>
        )}
      </div>
      <div className="h-72 px-3 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E3E8F2" />
            <XAxis dataKey="t" tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} />
            <YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Line type="monotone" dataKey="kw" stroke="#4A8445" strokeWidth={2.5} dot={{ r: 3.5, fill: "#4A8445", strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
