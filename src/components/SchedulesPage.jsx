import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { loadSchedule, saveSchedule } from "../data/scheduleStorage";
import { loadLiveDevices } from "../data/liveDeviceStorage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultDays = DAYS.map((day, index) => ({
  day,
  on: index < 5 ? "07:00" : "08:00",
  off: index < 5 ? "17:00" : "12:00",
  minTemp: 22,
  maxTemp: 25,
  repeat: index < 5,
}));

export default function SchedulesPage({ userId }) {
  const [devices, setDevices] = useState([]);
  const [building, setBuilding] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [savedDays, setSavedDays] = useState(defaultDays);
  const [draftDays, setDraftDays] = useState(defaultDays);
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const hasChanges = JSON.stringify(savedDays) !== JSON.stringify(draftDays);

  const targets = devices.flatMap((device) => [
    { key: `${device.device_id}:temp`, deviceId: device.device_id, building: device.building_name || "Location not assigned", label: `${device.display_name} · Temperature outlet`, channel: "temp" },
    { key: `${device.device_id}:water`, deviceId: device.device_id, building: device.building_name || "Location not assigned", label: `${device.display_name} · Water inlet solenoid`, channel: "water" },
  ]);
  const buildingOptions = [...new Set(targets.map((target) => target.building))];
  const deviceOptions = targets.filter((target) => target.building === building);
  const selectedTarget = deviceOptions.find((target) => target.key === deviceKey) || deviceOptions[0] || null;

  useEffect(() => {
    let isCurrent = true;
    if (!userId) {
      setDevices([]);
      setIsLoading(false);
      return undefined;
    }
    loadLiveDevices(userId)
      .then((loaded) => {
        if (!isCurrent) return;
        setDevices(loaded);
        setBuilding((current) => current || loaded.find((device) => device.building_name)?.building_name || (loaded.length ? "Location not assigned" : ""));
        setLoadError("");
      })
      .catch((error) => { if (isCurrent) setLoadError(error.message); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [userId]);

  useEffect(() => {
    if (!deviceOptions.length) {
      setDeviceKey("");
      return;
    }
    if (!deviceOptions.some((target) => target.key === deviceKey)) setDeviceKey(deviceOptions[0].key);
  }, [building, deviceKey, devices]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedTarget) return undefined;
    let isCurrent = true;
    setSavedDays(defaultDays);
    setDraftDays(defaultDays);
    loadSchedule(userId, building, selectedTarget.key)
      .then((days) => {
        if (!isCurrent) return;
        const schedule = days || defaultDays;
        setSavedDays(schedule);
        setDraftDays(schedule);
        setNotice("");
      })
      .catch((loadError) => { if (isCurrent) setNotice(loadError.message); });
    return () => { isCurrent = false; };
  }, [userId, building, selectedTarget?.key]);

  const updateDay = (day, changes) => {
    setDraftDays((current) => current.map((entry) =>
      entry.day === day ? { ...entry, ...changes } : entry
    ));
  };

  const saveChanges = async () => {
    if (!selectedTarget) return;
    const invalid = draftDays.find((entry) => {
      const minTemp = Number(entry.minTemp);
      const maxTemp = Number(entry.maxTemp);
      return minTemp < 16 || minTemp > 30 || maxTemp < 16 || maxTemp > 30 || minTemp > maxTemp;
    });
    if (invalid) {
      setNotice(`${invalid.day}: temperatures must be 16–30°C and minimum cannot exceed maximum.`);
      return;
    }
    try {
      setIsSaving(true);
      await saveSchedule(userId, building, selectedTarget.key, draftDays);
      setSavedDays(draftDays);
      setNotice("Schedule changes saved.");
    } catch (saveError) {
      setNotice(saveError.message || "Could not save schedule to the database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-l-4 border-warn bg-[#FFF9EB] px-4 py-3 text-sm text-ink">
        Weekly settings save to Supabase. The current ESP32 firmware does not yet execute cloud schedules; its local temperature and tank safety cutoffs remain in control.
      </div>
      {loadError && <p role="alert" className="text-sm text-crit">Could not load registered devices: {loadError}</p>}
      <Card>
        <PanelHeader title="OUTLET OPERATING SCHEDULE" right={hasChanges && <span className="text-xs font-semibold text-warn">Unsaved changes</span>} />
        <div className="flex flex-wrap gap-4 px-5 pb-4 pt-4">
          <label className="text-xs font-medium text-muted">Building<select value={building} onChange={(event) => setBuilding(event.target.value)} disabled={!buildingOptions.length} className="mt-1 block w-64 max-w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink disabled:bg-canvas"><option value="">Select a building</option>{buildingOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-xs font-medium text-muted">Registered device / channel<select value={selectedTarget?.key || ""} onChange={(event) => setDeviceKey(event.target.value)} disabled={!deviceOptions.length} className="mt-1 block w-80 max-w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink disabled:bg-canvas"><option value="">No registered device in this building</option>{deviceOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
        </div>

        <div className="space-y-2 px-4 pb-4 xl:hidden">
          {!selectedTarget && !isLoading && <p className="px-2 py-8 text-center text-sm text-muted">No active ESP32 device is registered. Register a device and assign its building before creating a schedule.</p>}
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
          <p role="status" className={`text-sm ${notice.includes("must not") ? "text-crit" : "text-ok"}`}>{notice || (selectedTarget ? `Configuration for ${selectedTarget.label}.` : "Select a registered device to edit its schedule.")}</p>
          <button type="button" onClick={saveChanges} disabled={!selectedTarget || !hasChanges || isSaving} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#376A34] disabled:cursor-not-allowed disabled:opacity-50"><Save size={15} />{isSaving ? "Saving..." : "Save changes"}</button>
        </div>
      </Card>
    </div>
  );
}
