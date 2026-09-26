import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings } from "../data/buildings";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STORAGE_KEY = "luntian-outlet-schedule";

const defaultDays = DAYS.map((day, index) => ({
  day,
  on: index < 5 ? "07:00" : "08:00",
  off: index < 5 ? "17:00" : "12:00",
  minTemp: 22,
  maxTemp: 25,
  repeat: index < 5,
}));

function loadSchedule(building, device) {
  try {
    const schedules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return schedules[`${building}::${device}`] || defaultDays;
  } catch {
    return defaultDays;
  }
}

export default function SchedulesPage() {
  const [building, setBuilding] = useState(buildings[0].name);
  const [device, setDevice] = useState("Aircon - Room 204");
  const [savedDays, setSavedDays] = useState(() => loadSchedule(buildings[0].name, "Aircon - Room 204"));
  const [draftDays, setDraftDays] = useState(() => loadSchedule(buildings[0].name, "Aircon - Room 204"));
  const [notice, setNotice] = useState("");
  const hasChanges = JSON.stringify(savedDays) !== JSON.stringify(draftDays);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const days = loadSchedule(building, device);
    setSavedDays(days);
    setDraftDays(days);
  }, [building, device]);

  const updateDay = (day, changes) => {
    setDraftDays((current) => current.map((entry) =>
      entry.day === day ? { ...entry, ...changes } : entry
    ));
  };

  const saveChanges = () => {
    const invalid = draftDays.find((entry) => {
      const minTemp = Number(entry.minTemp);
      const maxTemp = Number(entry.maxTemp);
      return minTemp < 16 || minTemp > 30 || maxTemp < 16 || maxTemp > 30 || minTemp > maxTemp;
    });
    if (invalid) {
      setNotice(`${invalid.day}: temperatures must be 16–30°C and minimum cannot exceed maximum.`);
      return;
    }
    let schedules = {};
    try {
      schedules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      schedules = {};
    }
    schedules[`${building}::${device}`] = draftDays;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    setSavedDays(draftDays);
    setNotice("Schedule changes saved.");
  };

  return (
    <div className="space-y-4">
      <Card>
        <PanelHeader title="OUTLET OPERATING SCHEDULE" right={hasChanges && <span className="text-xs font-semibold text-warn">Unsaved changes</span>} />
        <div className="flex flex-wrap gap-4 px-5 pb-4 pt-4">
          <label className="text-xs font-medium text-muted">Building<select value={building} onChange={(event) => setBuilding(event.target.value)} className="mt-1 block w-64 max-w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">{buildings.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Device<select value={device} onChange={(event) => setDevice(event.target.value)} className="mt-1 block w-64 max-w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"><option>Aircon - Room 204</option><option>Aircon - Room 205</option><option>Smart outlet group</option></select></label>
        </div>

        <div className="space-y-2 px-4 pb-4 xl:hidden">
          {draftDays.map((entry) => (
            <section key={entry.day} className="rounded-lg border border-border p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">{entry.day}</h3>
                <button type="button" role="switch" aria-checked={entry.repeat} aria-label={`${entry.repeat ? "Disable" : "Enable"} repeat for ${entry.day}`} onClick={() => updateDay(entry.day, { repeat: !entry.repeat })} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${entry.repeat ? "bg-accent" : "bg-border"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${entry.repeat ? "left-6" : "left-1"}`} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-muted">Time on<input aria-label={`${entry.day} time on`} type="time" value={entry.on} onChange={(event) => updateDay(entry.day, { on: event.target.value })} className="mt-1 block w-full min-w-0 rounded-md border border-border bg-white px-2 py-2 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /></label>
                <label className="text-xs font-medium text-muted">Time off<input aria-label={`${entry.day} time off`} type="time" value={entry.off} onChange={(event) => updateDay(entry.day, { off: event.target.value })} className="mt-1 block w-full min-w-0 rounded-md border border-border bg-white px-2 py-2 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /></label>
                <label className="text-xs font-medium text-muted">Min temperature<input aria-label={`${entry.day} minimum temperature`} type="number" min="16" max="30" value={entry.minTemp} onChange={(event) => updateDay(entry.day, { minTemp: event.target.value })} className="mt-1 block w-full min-w-0 rounded-md border border-border bg-white px-2 py-2 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /><span className="text-[10px] text-muted">°C</span></label>
                <label className="text-xs font-medium text-muted">Max temperature<input aria-label={`${entry.day} maximum temperature`} type="number" min="16" max="30" value={entry.maxTemp} onChange={(event) => updateDay(entry.day, { maxTemp: event.target.value })} className="mt-1 block w-full min-w-0 rounded-md border border-border bg-white px-2 py-2 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /><span className="text-[10px] text-muted">°C</span></label>
              </div>
            </section>
          ))}
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[930px] text-sm">
            <thead className="border-y border-border bg-canvas/60">
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Day</th>
                <th className="px-3 py-3 font-medium">Time On</th>
                <th className="px-3 py-3 font-medium">Time Off</th>
                <th className="px-3 py-3 font-medium">Min temperature</th>
                <th className="px-3 py-3 font-medium">Max temperature</th>
                <th className="px-5 py-3 font-medium">Repeat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {draftDays.map((entry) => (
                <tr key={entry.day} className={!entry.repeat ? "text-muted" : ""}>
                  <td className="px-5 py-3 font-medium text-ink">{entry.day}</td>
                  <td className="px-3 py-2"><input aria-label={`${entry.day} time on`} type="time" value={entry.on} onChange={(event) => updateDay(entry.day, { on: event.target.value })} className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /></td>
                  <td className="px-3 py-2"><input aria-label={`${entry.day} time off`} type="time" value={entry.off} onChange={(event) => updateDay(entry.day, { off: event.target.value })} className="rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /></td>
                  <td className="px-3 py-2"><div className="flex items-center gap-1"><input aria-label={`${entry.day} minimum temperature`} type="number" min="16" max="30" value={entry.minTemp} onChange={(event) => updateDay(entry.day, { minTemp: event.target.value })} className="w-20 rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /><span className="text-xs text-muted">°C</span></div></td>
                  <td className="px-3 py-2"><div className="flex items-center gap-1"><input aria-label={`${entry.day} maximum temperature`} type="number" min="16" max="30" value={entry.maxTemp} onChange={(event) => updateDay(entry.day, { maxTemp: event.target.value })} className="w-20 rounded-md border border-border bg-white px-2 py-1.5 text-sm text-ink disabled:bg-canvas" disabled={!entry.repeat} /><span className="text-xs text-muted">°C</span></div></td>
                  <td className="px-5 py-3"><button type="button" role="switch" aria-checked={entry.repeat} aria-label={`${entry.repeat ? "Disable" : "Enable"} repeat for ${entry.day}`} onClick={() => updateDay(entry.day, { repeat: !entry.repeat })} className={`relative h-6 w-11 rounded-full transition-colors ${entry.repeat ? "bg-accent" : "bg-border"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${entry.repeat ? "left-6" : "left-1"}`} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p role="status" className={`text-sm ${notice.includes("must not") ? "text-crit" : "text-ok"}`}>{notice || "Temperature range applies while the selected outlet is scheduled on."}</p>
          <button type="button" onClick={saveChanges} disabled={!hasChanges} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#376A34] disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} /> Save changes</button>
        </div>
      </Card>
    </div>
  );
}
