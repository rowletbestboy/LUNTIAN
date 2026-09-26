import { useState } from "react";
import { Building2, Droplet, Gauge, Waves } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";
import { buildings } from "../data/buildings";
import { waterTanksByBuilding } from "../data/waterTanks";

function getLevelColor(levelPct) {
  if (levelPct < 30) return "#D85A4A";
  if (levelPct < 55) return "#E8A317";
  return "#31AFC5";
}

function formatLiters(value) {
  return `${value.toLocaleString()} L`;
}

export default function TankMonitoringPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0].name);
  const tanks = waterTanksByBuilding[selectedBuilding] || [];
  const totalCapacity = tanks.reduce((total, tank) => total + tank.capacityL, 0);
  const waterStored = tanks.reduce(
    (total, tank) => total + Math.round((tank.capacityL * tank.levelPct) / 100),
    0
  );
  const dailyConsumption = tanks.reduce(
    (total, tank) => total + tank.dailyConsumptionL,
    0
  );
  const averageLevel = totalCapacity
    ? Math.round((waterStored / totalCapacity) * 100)
    : 0;
  const maxTankConsumption = Math.max(
    ...tanks.map((tank) => tank.dailyConsumptionL),
    1
  );

  const overviewStats = [
    {
      icon: Gauge,
      iconBg: getLevelColor(averageLevel),
      label: "Average Tank Level",
      value: `${averageLevel}%`,
      sub: `${tanks.length} ${tanks.length === 1 ? "tank" : "tanks"}`,
    },
    {
      icon: Droplet,
      iconBg: "#31AFC5",
      label: "Water Stored",
      value: formatLiters(waterStored),
      sub: `of ${formatLiters(totalCapacity)}`,
    },
    {
      icon: Waves,
      iconBg: "#4A8445",
      label: "Today's Consumption",
      value: formatLiters(dailyConsumption),
      sub: "Across this building",
    },
  ];

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <Card className="self-start overflow-hidden">
        <PanelHeader title="REGISTERED BUILDINGS" />
        <div className="max-h-[36vh] space-y-1 overflow-y-auto p-3 sm:max-h-[42vh] xl:max-h-[680px]">
          {buildings.map((building) => {
            const isSelected = selectedBuilding === building.name;

            return (
              <button
                key={building.name}
                type="button"
                onClick={() => setSelectedBuilding(building.name)}
                aria-pressed={isSelected}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  isSelected ? "bg-ice ring-1 ring-accent/25" : "hover:bg-canvas"
                }`}
              >
                <Building2 size={17} className="shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {building.name}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Building water overview
            </div>
            <h2 className="mt-1 text-xl font-bold text-ink">{selectedBuilding}</h2>
          </div>
          <span className="text-sm text-muted">{tanks.length} registered {tanks.length === 1 ? "tank" : "tanks"}</span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {overviewStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <Card className="mb-5">
          <PanelHeader
            title="WATER CONSUMPTION BY TANK"
            right={<span className="text-xs font-medium text-muted">Today</span>}
          />
          <div className="divide-y divide-border px-5 pb-1 pt-1">
            {tanks.map((tank) => {
              const share = dailyConsumption
                ? (tank.dailyConsumptionL / dailyConsumption) * 100
                : 0;
              const barWidth = (tank.dailyConsumptionL / maxTankConsumption) * 100;

              return (
                <div key={tank.name} className="py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                    <span className="truncate text-sm font-medium text-ink">{tank.name}</span>
                    <span className="text-sm font-semibold tabular-nums text-ink">
                      {formatLiters(tank.dailyConsumptionL)}
                    </span>
                    <span className="w-12 text-right text-xs tabular-nums text-muted">
                      {share.toFixed(0)}%
                    </span>
                    <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full bg-[#31AFC5]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">Tank levels</h3>
          <span className="text-xs text-muted">Current capacity and level</span>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {tanks.map((tank) => {
            const stored = Math.round((tank.capacityL * tank.levelPct) / 100);
            const color = getLevelColor(tank.levelPct);

            return (
              <Card key={tank.name} className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{tank.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums text-ink">{tank.levelPct}%</div>
                    <div className="text-xs font-medium" style={{ color }}>
                      {tank.levelPct < 30 ? "Low" : tank.levelPct < 55 ? "Monitor" : "Normal"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 rounded-lg bg-canvas/70 px-4 py-5">
                  <div className="flex flex-col items-center">
                    <div className="mb-1 h-2 w-20 rounded-t-md bg-[#6E8B98]" />
                    <div
                      role="img"
                      aria-label={`${tank.name}: ${tank.levelPct}% full`}
                      className="relative h-40 w-20 overflow-hidden rounded-b-xl rounded-t-sm border-2 border-[#6E8B98] bg-white shadow-inner"
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 transition-[height] duration-500"
                        style={{ height: `${tank.levelPct}%`, backgroundColor: color }}
                      />
                      <div className="absolute inset-0 flex flex-col justify-between py-2">
                        {["75%", "50%", "25%"].map((mark) => (
                          <div key={mark} className="flex items-center gap-1">
                            <span className="h-px w-2 bg-[#6E8B98]" />
                            <span className="rounded bg-white/80 px-0.5 text-[8px] font-medium text-ink">
                              {mark}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-semibold tabular-nums text-ink">
                      {formatLiters(stored)} stored
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs text-muted">Tank capacity</div>
                      <div className="mt-0.5 font-semibold tabular-nums text-ink">
                        {formatLiters(tank.capacityL)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Available space</div>
                      <div className="mt-0.5 font-semibold tabular-nums text-ink">
                        {formatLiters(tank.capacityL - stored)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Level</div>
                      <div className="mt-0.5 font-semibold tabular-nums text-ink">
                        {tank.levelPct}% full
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {tanks.length === 0 && (
            <Card className="p-6 text-center text-sm text-muted">
              No tank data registered for this building.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}