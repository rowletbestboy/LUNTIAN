import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "./Card";

const initialDays = [
  { day: "Monday", on: "7:00 AM", off: "5:00 PM", repeat: true },
  { day: "Tuesday", on: "7:00 AM", off: "5:00 PM", repeat: true },
  { day: "Wednesday", on: "7:00 AM", off: "5:00 PM", repeat: true },
  { day: "Thursday", on: "7:00 AM", off: "5:00 PM", repeat: true },
  { day: "Friday", on: "7:00 AM", off: "5:00 PM", repeat: true },
  { day: "Saturday", on: "-", off: "-", repeat: false },
  { day: "Sunday", on: "-", off: "-", repeat: false },
];

export default function SchedulesPage() {
  const [days, setDays] = useState(initialDays);

  const toggle = (day) => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, repeat: !d.repeat } : d))
    );
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          <Plus size={14} /> Add Schedule
        </button>
      </div>

      <Card>
        <div className="flex gap-4 px-5 pt-5">
          <div>
            <div className="mb-1 text-xs text-muted">Select Building</div>
            <select className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
              <option>Engineering Building</option>
              <option>Administration Building</option>
              <option>Library</option>
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs text-muted">Select Device</div>
            <select className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink">
              <option>Aircon - Room 204</option>
              <option>Aircon - Room 205</option>
            </select>
          </div>
        </div>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Day</th>
              <th className="px-5 py-3 font-medium">Time On</th>
              <th className="px-5 py-3 font-medium">Time Off</th>
              <th className="px-5 py-3 font-medium">Repeat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {days.map((d) => (
              <tr key={d.day}>
                <td className="px-5 py-3 text-ink">{d.day}</td>
                <td className="px-5 py-3 text-ink">{d.on}</td>
                <td className="px-5 py-3 text-ink">{d.off}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggle(d.day)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      d.repeat ? "bg-accent" : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                        d.repeat ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
