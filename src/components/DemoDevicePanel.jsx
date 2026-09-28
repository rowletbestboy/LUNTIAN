import { useEffect, useState } from "react";
import { Droplets, RefreshCw, Thermometer, ToggleLeft, Waves } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const DEVICE_ID = import.meta.env.VITE_DEMO_DEVICE_ID || "luntian-demo-esp32-01";
const REFRESH_MS = 5000;

function displayValue(value, suffix, digits = 1) {
  return Number.isFinite(value) ? `${Number(value).toFixed(digits)}${suffix}` : "--";
}

export default function DemoDevicePanel({ userId }) {
  const [reading, setReading] = useState(null);
  const [lastCommand, setLastCommand] = useState("");
  const [commandId, setCommandId] = useState(null);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!userId || !supabase) return undefined;
    let isCurrent = true;

    const refresh = async () => {
      const { data, error: queryError } = await supabase
        .from("device_telemetry")
        .select("measured_at, temperature_c, humidity_pct, water_distance_cm, water_level_pct, temp_relay_on, water_relay_on, temp_overheat, water_full, dht_sensor_fault, water_sensor_fault")
        .eq("device_id", DEVICE_ID)
        .order("measured_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!isCurrent) return;
      if (queryError) setError(queryError.message);
      else {
        setReading(data);
        setError("");
      }
    };

    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      isCurrent = false;
      window.clearInterval(timer);
    };
  }, [userId]);

  useEffect(() => {
    if (!commandId || !supabase) return undefined;
    let isCurrent = true;
    const startedAt = Date.now();

    const checkCommand = async () => {
      if (Date.now() - startedAt > 30000) {
        if (isCurrent) {
          setLastCommand("No device acknowledgement yet. Check that the ESP32 is online.");
          setCommandId(null);
        }
        return;
      }
      const { data, error: queryError } = await supabase
        .from("device_commands")
        .select("status, result")
        .eq("id", commandId)
        .maybeSingle();
      if (!isCurrent || queryError || !data || data.status === "pending") return;
      setLastCommand(`${data.status === "completed" ? "Applied" : "Rejected"}: ${data.result || "device response received"}`);
      setCommandId(null);
    };

    checkCommand();
    const timer = window.setInterval(checkCommand, 1500);
    return () => {
      isCurrent = false;
      window.clearInterval(timer);
    };
  }, [commandId]);

  const requestCommand = async (action) => {
    if (!userId || !supabase || isSending) return;
    setIsSending(true);
    setError("");
    try {
      const { data, error: insertError } = await supabase.from("device_commands").insert({
        device_id: DEVICE_ID,
        owner_id: userId,
        action,
      }).select("id").single();
      if (insertError) throw insertError;
      setLastCommand(`${action.replace("_", " ")} queued. Waiting for the ESP32.`);
      setCommandId(data.id);
    } catch (commandError) {
      setError(commandError.message || "Could not queue the device command.");
    } finally {
      setIsSending(false);
    }
  };

  const ageMs = reading ? Date.now() - new Date(reading.measured_at).getTime() : Infinity;
  const isOnline = ageMs < 30000;

  return (
    <Card className="mb-5 overflow-hidden">
      <PanelHeader
        title="CONNECTED DEMO DEVICE"
        right={<span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isOnline ? "text-ok" : "text-muted"}`}><span className={`h-2 w-2 rounded-full ${isOnline ? "bg-ok" : "bg-faint"}`} />{isOnline ? "Online" : "Offline"}</span>}
      />
      <div className="px-5 pb-5 pt-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>{DEVICE_ID}</span>
          <span>{reading ? `Last reading ${new Date(reading.measured_at).toLocaleTimeString()}` : "Waiting for first reading"}</span>
        </div>

        {!isSupabaseConfigured && <p role="alert" className="mb-3 text-sm text-crit">Configure the Supabase URL and key, then restart the app.</p>}
        {!userId && <p className="mb-3 text-sm text-muted">Sign in to view device readings and control the relays.</p>}
        {error && <p role="alert" className="mb-3 text-sm text-crit">{error}</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Temperature", value: displayValue(reading?.temperature_c, " °C"), icon: Thermometer },
            { label: "Humidity", value: displayValue(reading?.humidity_pct, "%"), icon: Droplets },
            { label: "Water level", value: displayValue(reading?.water_level_pct, "%", 0), icon: Waves },
            { label: "Distance", value: displayValue(reading?.water_distance_cm, " cm"), icon: RefreshCw },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-border px-3 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted"><Icon size={14} />{label}</div>
              <div className="mt-1 text-lg font-bold tabular-nums text-ink">{userId ? value : "--"}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <RelayControl
            title="Temperature outlet"
            isOn={reading?.temp_relay_on}
            locked={reading?.temp_overheat || reading?.dht_sensor_fault}
            lockReason={reading?.dht_sensor_fault ? "DHT22 fault: outlet locked off" : "Over-temperature cutoff active"}
            onOn={() => requestCommand("temp_on")}
            onOff={() => requestCommand("temp_off")}
            disabled={!userId || !isOnline || isSending}
          />
          <RelayControl
            title="Water inlet solenoid"
            isOn={reading?.water_relay_on}
            locked={reading?.water_full || reading?.water_sensor_fault}
            lockReason={reading?.water_sensor_fault ? "Ultrasonic fault: inlet locked off" : "Tank-full cutoff active"}
            onOn={() => requestCommand("water_on")}
            onOff={() => requestCommand("water_off")}
            disabled={!userId || !isOnline || isSending}
          />
        </div>
        {lastCommand && <p role="status" className="mt-3 text-sm text-accent">{lastCommand}</p>}
        {reading && (reading.temp_overheat || reading.water_full || reading.dht_sensor_fault || reading.water_sensor_fault) && (
          <p className="mt-3 text-sm font-semibold text-warn">{[reading.temp_overheat && "Temperature safety cutoff", reading.water_full && "Tank-full safety cutoff", reading.dht_sensor_fault && "DHT22 fault", reading.water_sensor_fault && "Ultrasonic fault"].filter(Boolean).join(" · ")}. The ESP32 blocks ON commands until safe.</p>
        )}
        <p className="mt-3 text-xs text-muted">Cloud readings refresh every 5 seconds. The ESP32 keeps safety cutoffs local if Wi-Fi is unavailable.</p>
      </div>
    </Card>
  );
}

function RelayControl({ title, isOn, locked, lockReason, onOn, onOff, disabled }) {
  return (
    <section className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className={`text-xs font-bold ${isOn ? "text-ok" : "text-muted"}`}>{isOn ? "ON" : isOn === false ? "OFF" : "--"}</span>
      </div>
      {locked && <p className="mt-1 text-xs text-warn">{lockReason}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onOn} disabled={disabled || locked || isOn} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-accent px-3 text-xs font-semibold text-white hover:bg-[#376A34] disabled:cursor-not-allowed disabled:opacity-45"><ToggleLeft size={14} />Turn on</button>
        <button type="button" onClick={onOff} disabled={disabled || isOn === false} className="min-h-9 flex-1 rounded-md border border-border px-3 text-xs font-semibold text-ink hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-45">Turn off</button>
      </div>
    </section>
  );
}