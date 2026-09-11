import { useState } from "react";
import { Zap, Droplet, Building2, Plug, AlertCircle } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { StatCard } from "./components/Card";
import ElectricityChart from "./components/ElectricityChart";
import BreakdownDonut from "./components/BreakdownDonut";
import WaterTankStatus from "./components/WaterTankStatus";
import RecentAlerts from "./components/RecentAlerts";
import BuildingsPage from "./components/BuildingsPage";
import BuildingDetailPage from "./components/BuildingDetailPage";
import RoomDetailPage from "./components/RoomDetailPage";
import WaterOverviewPage from "./components/WaterOverviewPage";
import DevicesPage from "./components/DevicesPage";
import SchedulesPage from "./components/SchedulesPage";
import AlertsPage from "./components/AlertsPage";
import ReportsPage from "./components/ReportsPage";
import PlaceholderPage from "./components/PlaceholderPage";

const dashboardStats = [
  { icon: Zap, iconBg: "#E8A317", label: "Total Electricity", value: "2,457 kW", sub: "Current Power" },
  { icon: Droplet, iconBg: "#2F6FED", label: "Total Water", value: "76%", sub: "Average Tank Level" },
  { icon: Building2, iconBg: "#8B6FE8", label: "Buildings Online", value: "12 / 15", sub: "Buildings" },
  { icon: Plug, iconBg: "#22A559", label: "Smart Outlets", value: "247", sub: "Active Outlets" },
  { icon: AlertCircle, iconBg: "#E0432B", label: "Alerts", value: "7", sub: "Active Alerts" },
];

// page keys that don't have a real design yet -> shown as an honest placeholder
const PLACEHOLDER_TITLES = {
  "campus-overview": "Campus Overview",
  "tank-monitoring": "Tank Monitoring",
  "water-consumption": "Water Consumption",
  automation: "Automation",
  analytics: "Analytics",
  "energy-savings": "Energy Savings",
};

const PAGE_META = {
  dashboard: { title: "Dashboard" },
  buildings: { title: "Buildings" },
  "water-overview": { title: "Water Overview" },
  devices: { title: "Smart Outlets" },
  schedules: { title: "Schedules" },
  alerts: { title: "Alerts" },
  reports: { title: "Reports" },
  "room-monitoring": { title: "Room 204" },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const navigate = (nextPage) => {
    setPage(nextPage);
    if (nextPage !== "buildings") setSelectedBuilding(null);
  };

  const openBuilding = (name) => {
    setSelectedBuilding(name);
    setPage("building-detail");
  };

  const openRoom = (room) => {
    setSelectedRoom(room);
    setPage("room-detail");
  };

  // Build breadcrumb + title for the current page
  let breadcrumb = null;
  let title = PAGE_META[page]?.title || "";
  let statusPill = null;

  if (page === "building-detail") {
    title = selectedBuilding;
    breadcrumb = [{ label: "Buildings", onClick: () => navigate("buildings") }];
  }
  if (page === "room-detail") {
    title = `Room ${selectedRoom}`;
    breadcrumb = [
      { label: "Buildings", onClick: () => navigate("buildings") },
      { label: selectedBuilding || "Engineering Building", onClick: () => setPage("building-detail") },
      { label: "2nd Floor" },
    ];
  }
  if (page === "room-monitoring") {
    breadcrumb = [{ label: "Buildings", onClick: () => navigate("buildings") }];
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar activePage={page === "building-detail" || page === "room-detail" ? "buildings" : page} onNavigate={navigate} />

      <main className="flex-1 overflow-y-auto p-6">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          rightLabel={page === "dashboard" ? "May 20, 2024" : undefined}
        />

        {page === "dashboard" && (
          <>
            <div className="mb-5 grid grid-cols-5 gap-4">
              {dashboardStats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
            <div className="mb-5 flex gap-4">
              <ElectricityChart />
              <BreakdownDonut />
            </div>
            <div className="flex gap-4">
              <WaterTankStatus />
              <RecentAlerts />
            </div>
          </>
        )}

        {page === "buildings" && <BuildingsPage onOpenBuilding={openBuilding} />}

        {page === "building-detail" && (
          <BuildingDetailPage buildingName={selectedBuilding} onOpenRoom={openRoom} />
        )}

        {page === "room-detail" && <RoomDetailPage room={selectedRoom} />}

        {page === "room-monitoring" && <RoomDetailPage room="204" />}

        {page === "water-overview" && <WaterOverviewPage />}

        {page === "devices" && <DevicesPage />}

        {page === "schedules" && <SchedulesPage />}

        {page === "alerts" && <AlertsPage />}

        {page === "reports" && <ReportsPage />}

        {PLACEHOLDER_TITLES[page] && <PlaceholderPage title={PLACEHOLDER_TITLES[page]} />}
      </main>
    </div>
  );
}
