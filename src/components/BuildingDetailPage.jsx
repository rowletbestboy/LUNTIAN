import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, PanelHeader, StatusPill } from "./Card";

const chartData = [
  { t: "12 AM", kw: 30 },
  { t: "4 AM", kw: 22 },
  { t: "8 AM", kw: 55 },
  { t: "12 PM", kw: 78 },
  { t: "4 PM", kw: 65 },
  { t: "8 PM", kw: 50 },
  { t: "12 AM", kw: 28 },
];

const floors = ["GF", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

const roomsByFloor = {
  "2nd Floor": [
    { room: "201", status: "Normal", power: "12.4 kW", today: "98 kWh" },
    { room: "202", status: "Normal", power: "18.2 kW", today: "132 kWh" },
    { room: "203", status: "Normal", power: "45.8 kW", today: "210 kWh" },
    { room: "204", status: "Critical", power: "67.3 kW", today: "328 kWh" },
    { room: "205", status: "Normal", power: "14.7 kW", today: "87 kWh" },
  ],
};

const devices = [
  { device: "Aircon - Room 204", status: "ON", power: "3.2 kW", schedule: "7:00 AM - 5:00 PM" },
  { device: "Aircon - Room 205", status: "OFF", power: "0 kW", schedule: "7:00 AM - 5:00 PM" },
];

export default function BuildingDetailPage({ buildingName, onOpenRoom }) {
  const [tab, setTab] = useState("Overview");
  const [floor, setFloor] = useState("2nd Floor");
  const rooms = roomsByFloor[floor] || [];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <StatusPill status="Normal" />
      </div>

      <div className="mb-4 flex gap-6 border-b border-border">
        {["Overview", "Floors", "Rooms", "Devices"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 text-sm ${
              tab === t
                ? "border-accent font-semibold text-accent"
                : "border-transparent text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="flex gap-4">
          <Card className="flex-[1.6]">
            <PanelHeader title="CONSUMPTION (TODAY)" />
            <div className="h-64 px-3 py-4">
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
          <Card className="flex-1">
            <PanelHeader title="DETAILS" />
            <div className="divide-y divide-border px-5 py-2">
              {[
                ["Total Floors", "4"],
                ["Total Rooms", "28"],
                ["Meters", "4"],
                ["Smart Outlets", "56"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2.5 text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold text-ink">{val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "Floors" && (
        <div>
          <div className="mb-4 flex gap-2">
            {floors.map((f) => (
              <button
                key={f}
                onClick={() => setFloor(f)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  floor === f
                    ? "border-accent bg-accent text-white font-semibold"
                    : "border-border bg-white text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <Card>
            <PanelHeader title={`${floor.toUpperCase()} OVERVIEW`} />
            <div className="px-5 pb-2 pt-3 text-sm font-bold text-ink">
              Rooms on {floor}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-2 font-medium">Room</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="px-5 py-2 font-medium">Current Power</th>
                  <th className="px-5 py-2 font-medium">Today's Consumption</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-muted">
                      No room data yet for {floor}.
                    </td>
                  </tr>
                )}
                {rooms.map((r) => (
                  <tr
                    key={r.room}
                    onClick={() => onOpenRoom(r.room)}
                    className="cursor-pointer hover:bg-canvas"
                  >
                    <td className="px-5 py-2.5 font-medium text-ink">{r.room}</td>
                    <td className="px-5 py-2.5"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-2.5 text-ink">{r.power}</td>
                    <td className="px-5 py-2.5 text-ink">{r.today}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "Rooms" && (
        <Card>
          <PanelHeader title="ALL ROOMS" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Room</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Current Power</th>
                <th className="px-5 py-2 font-medium">Today's Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(roomsByFloor["2nd Floor"] || []).map((r) => (
                <tr key={r.room} onClick={() => onOpenRoom(r.room)} className="cursor-pointer hover:bg-canvas">
                  <td className="px-5 py-2.5 font-medium text-ink">{r.room}</td>
                  <td className="px-5 py-2.5"><StatusPill status={r.status} /></td>
                  <td className="px-5 py-2.5 text-ink">{r.power}</td>
                  <td className="px-5 py-2.5 text-ink">{r.today}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "Devices" && (
        <Card>
          <PanelHeader title="DEVICES IN THIS BUILDING" />
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Device</th>
                <th className="px-5 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Power</th>
                <th className="px-5 py-2 font-medium">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {devices.map((d) => (
                <tr key={d.device}>
                  <td className="px-5 py-2.5 font-medium text-ink">{d.device}</td>
                  <td className="px-5 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.status === "ON" ? "bg-ok/10 text-ok" : "bg-faint/20 text-muted"}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-ink">{d.power}</td>
                  <td className="px-5 py-2.5 text-muted">{d.schedule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
