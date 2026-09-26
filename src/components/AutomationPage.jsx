import { useState } from "react";
import { Plus, Play, Power, Zap } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings } from "../data/buildings";

const initialRules = [
  {
    id: 1,
    name: "Turn off idle room outlets",
    condition: "Room unoccupied for 15 minutes",
    action: "Turn off selected outlets",
    scope: "College of Engineering · Room 204",
    enabled: true,
    lastRun: "Today, 10:42 AM · 3 outlets switched off",
  },
  {
    id: 2,
    name: "High power draw warning",
    condition: "Outlet draw exceeds 3.0 kW for 5 minutes",
    action: "Create a high-usage alert",
    scope: "All registered buildings",
    enabled: true,
    lastRun: "Today, 9:18 AM · No action needed",
  },
  {
    id: 3,
    name: "After-hours shutdown",
    condition: "Outside scheduled operating hours",
    action: "Turn off nonessential outlets",
    scope: "Administration Building",
    enabled: false,
    lastRun: "Yesterday, 5:05 PM · 8 outlets switched off",
  },
];

export default function AutomationPage() {
  const [rules, setRules] = useState(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [building, setBuilding] = useState(buildings[0].name);
  const [threshold, setThreshold] = useState("3.0");
  const [notice, setNotice] = useState("");
  const activeCount = rules.filter((rule) => rule.enabled).length;

  const toggleRule = (id) => {
    setRules((current) => current.map((rule) =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const addRule = (event) => {
    event.preventDefault();
    const cleanName = ruleName.trim();
    if (!cleanName) return;
    setRules((current) => [
      {
        id: Date.now(),
        name: cleanName,
        condition: `Outlet draw exceeds ${threshold} kW for 5 minutes`,
        action: "Create a high-usage alert",
        scope: building,
        enabled: true,
        lastRun: "Not run yet",
      },
      ...current,
    ]);
    setRuleName("");
    setShowForm(false);
    setNotice("Automation rule added.");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ice text-accent"><Zap size={19} /></span>
          <div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Rules configured</div><div className="mt-1 text-xl font-bold text-ink">{rules.length}</div></div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ok/10 text-ok"><Power size={19} /></span>
          <div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Rules active</div><div className="mt-1 text-xl font-bold text-ink">{activeCount}</div></div>
        </Card>
        <Card className="flex items-center justify-between gap-3 p-4">
          <div><div className="text-xs font-semibold uppercase tracking-wide text-muted">Automation status</div><div className="mt-1 text-sm font-bold text-ok">{activeCount ? "Running" : "Paused"}</div></div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-[#376A34]"><Plus size={15} /> Add rule</button>
        </Card>
      </div>

      {notice && <p role="status" className="text-sm font-medium text-ok">{notice}</p>}

      {showForm && (
        <Card className="p-5">
          <PanelHeader title="NEW HIGH-DRAW RULE" />
          <form onSubmit={addRule} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs font-medium text-muted">Rule name<input value={ruleName} onChange={(event) => setRuleName(event.target.value)} required className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" placeholder="e.g. Lab power warning" /></label>
            <label className="text-xs font-medium text-muted">Building<select value={building} onChange={(event) => setBuilding(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{buildings.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
            <label className="text-xs font-medium text-muted">Draw threshold (kW)<input type="number" min="0.1" step="0.1" value={threshold} onChange={(event) => setThreshold(event.target.value)} className="mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink" /></label>
            <div className="flex items-end gap-2"><button type="submit" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white">Save rule</button><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink">Cancel</button></div>
          </form>
        </Card>
      )}

      <Card>
        <PanelHeader title="AUTOMATION RULES" />
        <div className="divide-y divide-border px-5">
          {rules.map((rule) => (
            <article key={rule.id} className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-ink">{rule.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${rule.enabled ? "bg-ok/10 text-ok" : "bg-canvas text-muted"}`}>{rule.enabled ? "Active" : "Paused"}</span></div>
                <div className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
                  <p><span className="text-muted">When: </span><span className="text-ink">{rule.condition}</span></p>
                  <p><span className="text-muted">Then: </span><span className="text-ink">{rule.action}</span></p>
                  <p className="sm:col-span-2"><span className="text-muted">Scope: </span><span className="text-ink">{rule.scope}</span></p>
                  <p className="sm:col-span-2"><span className="text-muted">Last run: </span><span className="text-ink">{rule.lastRun}</span></p>
                </div>
              </div>
              <button type="button" role="switch" aria-checked={rule.enabled} aria-label={`${rule.enabled ? "Pause" : "Enable"} ${rule.name}`} onClick={() => toggleRule(rule.id)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${rule.enabled ? "bg-accent" : "bg-border"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${rule.enabled ? "left-6" : "left-1"}`} /></button>
            </article>
          ))}
        </div>
      </Card>

      <Card>
        <PanelHeader title="RECENT RULE ACTIVITY" right={<span className="flex items-center gap-1 text-xs text-muted"><Play size={12} /> Latest runs</span>} />
        <div className="divide-y divide-border px-5">
          {rules.slice(0, 4).map((rule) => <div key={`run-${rule.id}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-ink">{rule.name}</span><span className="text-xs text-muted">{rule.lastRun}</span></div>)}
        </div>
      </Card>
    </div>
  );
}
