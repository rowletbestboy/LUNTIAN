import { Building2, Gauge, Leaf, Zap } from "lucide-react";
import { Card, PanelHeader, StatCard } from "./Card";
import { buildings, getBuildingConsumptionKwh, getBuildingEmissionsKg } from "../data/buildings";

const buildingConsumption = buildings
  .map((building) => ({
    ...building,
    consumption: getBuildingConsumptionKwh(building),
    emissionsKg: getBuildingEmissionsKg(building),
  }))
  .sort((a, b) => b.consumption - a.consumption);

const totalConsumption = buildingConsumption.reduce(
  (total, building) => total + building.consumption,
  0
);
const highestConsumption = buildingConsumption[0]?.consumption || 1;
const totalEmissionsKg = buildingConsumption.reduce(
  (total, building) => total + building.emissionsKg,
  0
);

const campusStats = [
  {
    icon: Zap,
    iconBg: "#E8A317",
    label: "Today's Electricity",
    value: `${totalConsumption.toLocaleString()} kWh`,
    sub: "All registered buildings",
  },
  {
    icon: Gauge,
    iconBg: "#4A8445",
    label: "Current Campus Demand",
    value: "2,457 kW",
    sub: "Across campus",
  },
  {
    icon: Building2,
    iconBg: "#22A559",
    label: "Buildings Reporting",
    value: String(buildings.length),
    sub: "Registered buildings",
  },
  {
    icon: Leaf,
    iconBg: "#31AFC5",
    label: "Today's Carbon Emissions",
    value: `${(totalEmissionsKg / 1000).toFixed(2)} tCO₂e`,
    sub: "Based on 0.7 kg CO₂e per kWh",
  },
];

export default function CampusOverviewPage() {
  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {campusStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card>
        <PanelHeader
          title="ELECTRICITY CONSUMPTION BY BUILDING"
          right={<span className="text-xs font-medium text-muted">Today · kWh</span>}
        />
        <div className="divide-y divide-border px-5 pb-2 pt-1">
          {buildingConsumption.map((building, index) => {
            const campusShare = (building.consumption / totalConsumption) * 100;
            const relativeBar = (building.consumption / highestConsumption) * 100;

            return (
              <div key={building.name} className="py-3.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {building.name}
                      </span>
                      <span className="block text-xs tabular-nums text-muted">
                        {building.emissionsKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e
                      </span>
                    </div>
                  </div>
                  <span className="text-right text-sm font-semibold tabular-nums text-ink">
                    {building.consumption.toLocaleString()} kWh
                  </span>
                  <span className="w-14 text-right text-xs tabular-nums text-muted">
                    {campusShare.toFixed(1)}%
                  </span>
                  <div className="col-span-3 ml-8 h-1.5 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${relativeBar}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-canvas/60 px-5 py-3.5 text-sm">
          <div>
            <span className="font-semibold text-ink">Campus total</span>
            <span className="ml-2 text-xs text-muted">
              {totalEmissionsKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e
            </span>
          </div>
          <span className="font-bold tabular-nums text-ink">{totalConsumption.toLocaleString()} kWh</span>
        </div>
      </Card>
    </div>
  );
}