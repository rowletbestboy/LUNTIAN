import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, PanelHeader } from "./Card";

const initialDevices = [
  { device: "Aircon - Room 204", location: "Eng. Bldg. / 2F", status: "ON", power: "3.2 kW", schedule: "7:00 AM - 5:00 PM" },
  { device: "Aircon - Room 205", location: "Eng. Bldg. / 2F", status: "OFF", power: "0 kW", schedule: "7:00 AM - 5:00 PM" },
  { device: "Aircon - Room 306", location: "Eng. Bldg. / 3F", status: "ON", power: "2.8 kW", schedule: "7:00 AM - 5:00 PM" },
  { device: "Aircon - Room 101", location: "Admin Bldg. / 1F", status: "OFF", power: "0 kW", schedule: "8:00 AM - 6:00 PM" },
  { device: "Aircon - Library 1F", location: "Library / 1F", status: "ON", power: "1.9 kW", schedule: "7:00 AM - 5:00 PM" },
];

export default function DevicesPage() {
  const [devices, setDevices] = useState(initialDevices);
  const [tab, setTab] = useState("All Devices");

  const toggle = (name) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.device === name ? { ...d, status: d.status === "ON" ? "OFF" : "ON" } : d
      )
    );
  };

  const filtered = devices.filter((d) => {
    if (tab === "Currently ON") return d.status === "ON";
    if (tab === "Currently OFF") return d.status === "OFF";
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          <Plus size={14} /> Add Device
        </button>
      </div>

      <Card>
        <PanelHeader title="SMART OUTLETS" />
        <div className="flex gap-6 border-b border-border px-5 pt-3">
          {["All Devices", "Currently ON", "Currently OFF", "Scheduled"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-2 text-sm ${
                tab === t ? "border-accent font-semibold text-accent" : "border-transparent text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Device</th>
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Power</th>
              <th className="px-5 py-3 font-medium">Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted">
                  No devices in this view.
                </td>
              </tr>
            )}
            {filtered.map((d) => (
              <tr key={d.device}>
                <td className="px-5 py-3 font-medium text-ink">{d.device}</td>
                <td className="px-5 py-3 text-muted">{d.location}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggle(d.device)}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      d.status === "ON" ? "bg-ok/10 text-ok" : "bg-faint/20 text-muted"
                    }`}
                  >
                    {d.status}
                  </button>
                </td>
                <td className="px-5 py-3 text-ink">{d.power}</td>
                <td className="px-5 py-3 text-muted">{d.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
