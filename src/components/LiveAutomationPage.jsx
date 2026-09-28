import { useEffect, useState } from "react";
import { Plus, Power, Trash2, Workflow } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { loadLiveDevices } from "../data/liveDeviceStorage";
import { supabase } from "../lib/supabase";

const CONDITIONS = {
  temperature_above: "Temperature above threshold",
  water_level_below: "Tank level below threshold",
  sensor_fault: "A sensor reports a fault",
  device_offline: "Device has no recent readings",
};
const ACTIONS = {
  turn_temperature_off: "Request temperature outlet OFF",
  turn_water_inlet_off: "Request water inlet OFF",
  notify_only: "Show an alert only",
};

export default function LiveAutomationPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [rules, setRules] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("temperature_above");
  const [threshold, setThreshold] = useState("36");
  const [action, setAction] = useState("notify_only");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = async (isCurrent = () => true) => {
    if (!userId || !supabase) return;
    const [{ data: liveDevices, error: deviceError }, { data: liveRules, error: ruleError }] = await Promise.all([
      loadLiveDevices(userId).then((data) => ({ data, error: null })).catch((loadError) => ({ data: [], error: loadError })),
      supabase.from("automation_rules").select("id, device_id, name, condition, threshold, action, enabled, created_at").eq("owner_id", userId).order("created_at", { ascending: false }),
    ]);
    if (!isCurrent()) return;
    if (deviceError || ruleError) setError((deviceError || ruleError).message);
    else {
      setDevices(liveDevices || []);
      setRules(liveRules || []);
      setDeviceId((current) => current || liveDevices?.[0]?.device_id || "");
      setError("");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let isCurrent = true;
    refresh(() => isCurrent);
    const timer = window.setInterval(() => refresh(() => isCurrent), 10000);
    return () => { isCurrent = false; window.clearInterval(timer); };
  }, [userId]);

  const needsThreshold = condition === "temperature_above" || condition === "water_level_below";

  const addRule = async (event) => {
    event.preventDefault();
    if (!deviceId || !name.trim()) return;
    if (needsThreshold && (!Number.isFinite(Number(threshold)) || Number(threshold) < 0)) {
      setError("Enter a valid non-negative trigger threshold.");
      return;
    }
    setIsSaving(true);
    setError("");
    setMessage("");
    const { error: insertError } = await supabase.from("automation_rules").insert({
      owner_id: userId,
      device_id: deviceId,
      name: name.trim(),
      condition,
      threshold: needsThreshold ? Number(threshold) : null,
      action,
    });
    if (insertError) setError(insertError.message);
    else {
      setName("");
      setMessage("Rule definition saved.");
      await refresh();
    }
    setIsSaving(false);
  };

  const toggleRule = async (rule) => {
    const { error: updateError } = await supabase.from("automation_rules").update({ enabled: !rule.enabled }).eq("id", rule.id);
    if (updateError) setError(updateError.message);
    else await refresh();
  };

  const removeRule = async (ruleId) => {
    const { error: deleteError } = await supabase.from("automation_rules").delete().eq("id", ruleId);
    if (deleteError) setError(deleteError.message);
    else await refresh();
  };

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-warn bg-[#FFF9EB] px-4 py-3 text-sm text-ink">These rule definitions are stored in Supabase, but the current ESP32 firmware does not fetch or execute custom rules. The device continues to enforce its built-in over-temperature and tank-full cutoffs locally.</div>
      {error && <p role="alert" className="text-sm text-crit">{error}</p>}
      {message && <p role="status" className="text-sm text-accent">{message}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ice text-accent"><Workflow size={19} /></span><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Rule definitions</div><div className="mt-1 text-xl font-bold text-ink">{isLoading ? "--" : rules.length}</div></div></Card>
        <Card className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ok/10 text-ok"><Power size={19} /></span><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Enabled</div><div className="mt-1 text-xl font-bold text-ink">{isLoading ? "--" : rules.filter((rule) => rule.enabled).length}</div></div></Card>
        <Card className="flex items-center gap-3 p-4"><div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Device controllers</div><div className="mt-1 text-xl font-bold text-ink">{devices.length}</div></div></Card>
      </div>

      <Card>
        <PanelHeader title="ADD RULE DEFINITION" />
        <form onSubmit={addRule} className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-xs font-medium text-muted">Rule name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="e.g. Low tank warning" /></label>
          <label className="text-xs font-medium text-muted">Device<select required value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{devices.map((device) => <option key={device.device_id} value={device.device_id}>{device.display_name}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">When<select value={condition} onChange={(event) => setCondition(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{Object.entries(CONDITIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Threshold<input type="number" min="0" step="0.1" disabled={!needsThreshold} required={needsThreshold} value={needsThreshold ? threshold : ""} placeholder={needsThreshold ? "Threshold value" : "Not required"} onChange={(event) => setThreshold(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink disabled:bg-canvas" /></label>
          <label className="text-xs font-medium text-muted">Then<select value={action} onChange={(event) => setAction(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{Object.entries(ACTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></label>
          <div className="flex justify-end sm:col-span-2 xl:col-span-5"><button type="submit" disabled={!devices.length || isSaving} className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#376A34] disabled:opacity-50"><Plus size={15} />{isSaving ? "Saving..." : "Save rule"}</button></div>
        </form>
      </Card>

      <Card>
        <PanelHeader title="SAVED RULE DEFINITIONS" />
        <div className="divide-y divide-border px-5">
          {isLoading ? <p className="py-8 text-center text-sm text-muted">Loading rules...</p> : !rules.length ? <p className="py-8 text-center text-sm text-muted">No rules configured.</p> : rules.map((rule) => {
            const device = devices.find((item) => item.device_id === rule.device_id);
            const unit = rule.condition === "temperature_above" ? "°C" : rule.condition === "water_level_below" ? "%" : "";
            return <article key={rule.id} className="flex flex-wrap items-center gap-3 py-4"><span className={`h-2.5 w-2.5 rounded-full ${rule.enabled ? "bg-ok" : "bg-faint"}`} /><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-ink">{rule.name}</div><div className="mt-1 text-xs text-muted">{device?.display_name || rule.device_id} · {CONDITIONS[rule.condition]}{rule.threshold !== null ? ` ${rule.threshold}${unit}` : ""} · {ACTIONS[rule.action]}</div><div className="mt-1 text-[11px] text-warn">Saved only; custom rules are not executed by the current firmware.</div></div><button type="button" onClick={() => toggleRule(rule)} role="switch" aria-checked={rule.enabled} aria-label={`${rule.enabled ? "Disable" : "Enable"} ${rule.name}`} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${rule.enabled ? "bg-accent" : "bg-border"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${rule.enabled ? "left-6" : "left-1"}`} /></button><button type="button" onClick={() => removeRule(rule.id)} title="Delete rule" className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted hover:bg-canvas hover:text-crit"><Trash2 size={15} /></button></article>;
          })}
        </div>
      </Card>
    </div>
  );
}
