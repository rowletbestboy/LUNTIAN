import { useEffect, useState } from "react";
import { Activity, Droplet, Thermometer, Waves } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PanelHeader, StatCard } from "./Card";
import { supabase } from "../lib/supabase";
import { loadLiveDevices } from "../data/liveDeviceStorage";

const METRICS = {
  water_level_pct: { label: "Tank level", unit: "%", icon: Waves, color: "#31AFC5" },
  temperature_c: { label: "Temperature", unit: "°C", icon: Thermometer, color: "#E8A317" },
  humidity_pct: { label: "Humidity", unit: "%", icon: Droplet, color: "#4A8445" },
};
const PERIODS = { "24 hours": 24, "7 days": 24 * 7, "30 days": 24 * 30 };

export default function LiveAnalyticsPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("all");
  const [period, setPeriod] = useState("24 hours");
  const [metric, setMetric] = useState("water_level_pct");
  const [readings, setReadings] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    if (!userId) { setDevices([]); setIsLoading(false); return undefined; }
    loadLiveDevices(userId)
      .then((result) => { if (isCurrent) setDevices(result); })
      .catch((loadError) => { if (isCurrent) setError(loadError.message); });
    return () => { isCurrent = false; };
  }, [userId]);

  useEffect(() => {
    let isCurrent = true;
    if (!userId || !supabase) { setReadings([]); setIsLoading(false); return undefined; }
    const cutoff = new Date(Date.now() - PERIODS[period] * 60 * 60 * 1000).toISOString();
    let query = supabase.from("device_telemetry")
      .select("device_id, measured_at, temperature_c, humidity_pct, water_level_pct, temp_relay_on, water_relay_on")
      .eq("owner_id", userId)
      .gte("measured_at", cutoff)
      .order("measured_at", { ascending: true })
      .limit(5000);
    if (deviceId !== "all") query = query.eq("device_id", deviceId);
    query.then(({ data, error: queryError }) => {
      if (!isCurrent) return;
      if (queryError) setError(queryError.message);
      else { setReadings(data || []); setError(""); }
    }).finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [userId, deviceId, period]);

  const selectedMetric = METRICS[metric];
  const chartData = readings.filter((row) => Number.isFinite(row[metric])).map((row) => ({
    time: new Date(row.measured_at).toLocaleString(undefined, period === "24 hours" ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", hour: "numeric" }),
    value: row[metric],
  }));
  const values = chartData.map((point) => point.value);
  const latest = values.length ? values[values.length - 1] : null;
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const minimum = values.length ? Math.min(...values) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="text-xs font-medium text-muted">Device<select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-1 block min-w-52 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option value="all">All registered devices</option>{devices.map((device) => <option key={device.device_id} value={device.device_id}>{device.display_name}</option>)}</select></label>
        <label className="text-xs font-medium text-muted">Period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{Object.keys(PERIODS).map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="text-xs font-medium text-muted">Measure<select value={metric} onChange={(event) => setMetric(event.target.value)} className="mt-1 block rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{Object.entries(METRICS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
      </div>
      {error && <p role="alert" className="text-sm text-crit">Could not load telemetry history: {error}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={selectedMetric.icon} iconBg={selectedMetric.color} label={`Latest ${selectedMetric.label}`} value={latest === null ? "--" : `${latest.toFixed(1)} ${selectedMetric.unit}`} sub={values.length ? new Date(readings.filter((row) => Number.isFinite(row[metric])).at(-1).measured_at).toLocaleString() : "No readings in selected period"} />
        <StatCard icon={Activity} iconBg="#4A8445" label="Period average" value={average === null ? "--" : `${average.toFixed(1)} ${selectedMetric.unit}`} sub={`${values.length} recorded samples`} />
        <StatCard icon={Droplet} iconBg="#E8A317" label="Period minimum" value={minimum === null ? "--" : `${minimum.toFixed(1)} ${selectedMetric.unit}`} sub={period} />
      </div>
      <Card>
        <PanelHeader title={`${selectedMetric.label.toUpperCase()} HISTORY`} right={<span className="text-xs text-muted">{`Recorded device telemetry · ${selectedMetric.unit}`}</span>} />
        <div className="h-80 px-3 py-5">
          {isLoading ? <p className="pt-24 text-center text-sm text-muted">Loading telemetry history...</p> : chartData.length ? (
            <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 18, left: -12, bottom: 0 }}><defs><linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={selectedMetric.color} stopOpacity={0.28} /><stop offset="100%" stopColor={selectedMetric.color} stopOpacity={0.02} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#E3E8F2" /><XAxis dataKey="time" tick={{ fill: "#8A93A8", fontSize: 10 }} axisLine={{ stroke: "#E3E8F2" }} tickLine={false} minTickGap={28} /><YAxis tick={{ fill: "#8A93A8", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ${selectedMetric.unit}`, selectedMetric.label]} /><Area type="monotone" dataKey="value" stroke={selectedMetric.color} fill="url(#metricFill)" strokeWidth={2.5} connectNulls={false} /></AreaChart></ResponsiveContainer>
          ) : <p className="pt-24 text-center text-sm text-muted">No recorded values for this measure and period.</p>}
        </div>
      </Card>
      <p className="text-xs text-muted">Electricity kWh, power demand, carbon, and water-flow analytics need meters/flow sensors that are not part of the current ESP32.</p>
    </div>
  );
}
