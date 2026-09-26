import { useState } from "react";
import { CircleDollarSign, Leaf, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PanelHeader, StatCard } from "./Card";
import { ELECTRICITY_EMISSIONS_KG_PER_KWH } from "../data/buildings";

const savingSources = [
  { source: "Schedules", kwh: 3820 },
  { source: "Automation", kwh: 2460 },
  { source: "Standby reduction", kwh: 1489 },
];

function loadAssumptions() {
  try {
    return JSON.parse(localStorage.getItem("luntian-energy-savings-assumptions") || "null");
  } catch {
    return null;
  }
}

export default function EnergySavingsPage() {
  const [assumptions] = useState(loadAssumptions);
  const [baselineKwh, setBaselineKwh] = useState(assumptions?.baselineKwh ?? 62000);
  const [actualKwh, setActualKwh] = useState(assumptions?.actualKwh ?? 54231);
  const [rate, setRate] = useState(assumptions?.rate ?? 12.5);
  const [notice, setNotice] = useState("");
  const savedKwh = Math.max(0, Number(baselineKwh) - Number(actualKwh));
  const costAvoided = savedKwh * Number(rate);
  const reductionPct = baselineKwh ? (savedKwh / Number(baselineKwh)) * 100 : 0;
  const emissionsAvoided = savedKwh * ELECTRICITY_EMISSIONS_KG_PER_KWH;

  const saveAssumptions = (event) => {
    event.preventDefault();
    localStorage.setItem("luntian-energy-savings-assumptions", JSON.stringify({ baselineKwh, actualKwh, rate }));
    setNotice("Estimation assumptions updated.");
  };

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-warn bg-[#FFF9EB] px-4 py-3 text-sm text-ink">
        Savings are estimates based on the entered baseline and electricity rate. Replace these sample assumptions with verified meter history before using for formal reporting.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Zap} iconBg="#4A8445" label="Estimated energy saved" value={`${savedKwh.toLocaleString()} kWh`} sub="Baseline minus measured usage" />
        <StatCard icon={CircleDollarSign} iconBg="#E8A317" label="Estimated cost avoided" value={`₱${costAvoided.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub={`At ₱${Number(rate).toFixed(2)} per kWh`} />
        <StatCard icon={Leaf} iconBg="#31AFC5" label="Estimated emissions avoided" value={`${(emissionsAvoided / 1000).toFixed(2)} tCO₂e`} sub={`Using ${ELECTRICITY_EMISSIONS_KG_PER_KWH} kg CO₂e per kWh`} />
        <StatCard icon={Zap} iconBg="#8B6FE8" label="Usage reduction" value={`${reductionPct.toFixed(1)}%`} sub="Compared with baseline" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card>
          <PanelHeader title="ESTIMATED SAVINGS BY SOURCE" right={<span className="text-xs text-muted">This month · sample estimate</span>} />
          <div className="h-72 px-3 py-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingSources} margin={{ top: 5, right: 12, left: -15, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E3E8F2" />
                <XAxis dataKey="source" tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} />
                <YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} kWh`, "Estimated saved"]} />
                <Bar dataKey="kwh" fill="#4A8445" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <PanelHeader title="ESTIMATION ASSUMPTIONS" />
          <form onSubmit={saveAssumptions} className="mt-4 space-y-4">
            <label className="block text-xs font-medium text-muted">Baseline monthly energy (kWh)<input type="number" min="0" value={baselineKwh} onChange={(event) => setBaselineKwh(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" /></label>
            <label className="block text-xs font-medium text-muted">Current monthly energy (kWh)<input type="number" min="0" value={actualKwh} onChange={(event) => setActualKwh(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" /></label>
            <label className="block text-xs font-medium text-muted">Electricity rate (₱/kWh)<input type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" /></label>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4"><span role="status" className="text-xs text-ok">{notice || "Values update the estimate immediately."}</span><button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">Save assumptions</button></div>
          </form>
        </Card>
      </div>

      <Card className="px-5 py-4">
        <h2 className="text-sm font-bold text-ink">Calculation basis</h2>
        <p className="mt-1 text-xs leading-5 text-muted">Estimated kWh saved = baseline monthly energy minus current monthly energy. Cost avoided = estimated kWh saved multiplied by the electricity rate. Emissions use a placeholder factor of {ELECTRICITY_EMISSIONS_KG_PER_KWH} kg CO₂e/kWh and should be replaced with the applicable grid factor.</p>
      </Card>
    </div>
  );
}
