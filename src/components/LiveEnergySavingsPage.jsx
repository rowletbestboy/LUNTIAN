import { useState } from "react";
import { CircleDollarSign, Leaf, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PanelHeader, StatCard } from "./Card";

function loadAssumptions() {
  try {
    return JSON.parse(localStorage.getItem("luntian-energy-savings-assumptions") || "null");
  } catch {
    return null;
  }
}

export default function LiveEnergySavingsPage() {
  const [assumptions, setAssumptions] = useState(loadAssumptions);
  const [baselineKwh, setBaselineKwh] = useState(assumptions?.baselineKwh ?? "");
  const [actualKwh, setActualKwh] = useState(assumptions?.actualKwh ?? "");
  const [rate, setRate] = useState(assumptions?.rate ?? "");
  const [emissionsFactor, setEmissionsFactor] = useState(assumptions?.emissionsFactor ?? "");
  const [message, setMessage] = useState("");
  const hasComparison = baselineKwh !== "" && actualKwh !== "" && Number.isFinite(Number(baselineKwh)) && Number.isFinite(Number(actualKwh));
  const savedKwh = hasComparison ? Number(baselineKwh) - Number(actualKwh) : null;
  const costDelta = savedKwh !== null && rate !== "" ? savedKwh * Number(rate) : null;
  const emissionsDelta = savedKwh !== null && emissionsFactor !== "" ? savedKwh * Number(emissionsFactor) : null;
  const reductionPct = hasComparison && Number(baselineKwh) > 0 ? savedKwh / Number(baselineKwh) * 100 : null;
  const chartData = hasComparison ? [{ period: "Baseline", kwh: Number(baselineKwh) }, { period: "Actual", kwh: Number(actualKwh) }] : [];

  const saveAssumptions = (event) => {
    event.preventDefault();
    const values = { baselineKwh, actualKwh, rate, emissionsFactor };
    localStorage.setItem("luntian-energy-savings-assumptions", JSON.stringify(values));
    setAssumptions(values);
    setMessage("Your entered assumptions were saved in this browser.");
  };
  const fmt = (value, digits = 0) => value === null ? "--" : value.toLocaleString(undefined, { maximumFractionDigits: digits });

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-warn bg-[#FFF9EB] px-4 py-3 text-sm text-ink">Enter verified meter readings for a comparison. This page does not infer electricity use from the current ESP32 because it has no energy meter.</div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Zap} iconBg="#4A8445" label="Energy change" value={savedKwh === null ? "--" : `${fmt(savedKwh)} kWh`} sub={savedKwh === null ? "Enter baseline and actual kWh" : savedKwh >= 0 ? "Estimated saving" : "Usage increased"} />
        <StatCard icon={CircleDollarSign} iconBg="#E8A317" label="Cost change" value={costDelta === null ? "--" : `₱${fmt(costDelta)}`} sub={rate === "" ? "Enter electricity rate" : `At ₱${Number(rate).toFixed(2)} per kWh`} />
        <StatCard icon={Leaf} iconBg="#31AFC5" label="Emissions change" value={emissionsDelta === null ? "--" : `${fmt(emissionsDelta / 1000, 2)} tCO₂e`} sub={emissionsFactor === "" ? "Enter your grid emissions factor" : `${emissionsFactor} kg CO₂e/kWh`} />
        <StatCard icon={Zap} iconBg="#8B6FE8" label="Usage change" value={reductionPct === null ? "--" : `${fmt(reductionPct, 1)}%`} sub="Baseline compared with actual" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)]">
        <Card>
          <PanelHeader title="BASELINE VS ACTUAL ELECTRICITY" right={<span className="text-xs text-muted">User-entered kWh</span>} />
          <div className="h-72 px-3 py-5">
            {chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 12, left: -15, bottom: 0 }}><CartesianGrid vertical={false} stroke="#E3E8F2" /><XAxis dataKey="period" tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} /><YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${Number(value).toLocaleString()} kWh`, "Energy"]} /><Bar dataKey="kwh" fill="#4A8445" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer> : <p className="pt-24 text-center text-sm text-muted">Enter baseline and actual readings to compare them.</p>}
          </div>
        </Card>
        <Card>
          <PanelHeader title="COMPARISON INPUTS" />
          <form onSubmit={saveAssumptions} className="space-y-4 p-5">
            <label className="block text-xs font-medium text-muted">Baseline energy (kWh)<input type="number" min="0" step="any" value={baselineKwh} onChange={(event) => setBaselineKwh(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="Enter verified baseline" required /></label>
            <label className="block text-xs font-medium text-muted">Actual energy (kWh)<input type="number" min="0" step="any" value={actualKwh} onChange={(event) => setActualKwh(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="Enter meter reading" required /></label>
            <label className="block text-xs font-medium text-muted">Electricity rate (₱/kWh)<input type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="Optional" /></label>
            <label className="block text-xs font-medium text-muted">Grid emissions factor (kg CO₂e/kWh)<input type="number" min="0" step="any" value={emissionsFactor} onChange={(event) => setEmissionsFactor(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="Optional verified factor" /></label>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4"><span role="status" className="text-xs text-accent">{message || (assumptions ? "Saved locally in this browser." : "No assumptions saved yet.")}</span><button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#376A34]">Save inputs</button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
