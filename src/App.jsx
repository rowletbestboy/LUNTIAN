import { useState } from "react";
import { Zap, Droplet, Leaf, Plug, AlertCircle } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { StatCard } from "./components/Card";
import ElectricityChart from "./components/ElectricityChart";
import BreakdownDonut from "./components/BreakdownDonut";
import WaterTankStatus from "./components/WaterTankStatus";
import RecentAlerts from "./components/RecentAlerts";
import BuildingsPage from "./components/BuildingsPage";
import BuildingDetailPage from "./components/BuildingDetailPage";
import CampusOverviewPage from "./components/CampusOverviewPage";
import WaterOverviewPage from "./components/WaterOverviewPage";
import TankMonitoringPage from "./components/TankMonitoringPage";
import DevicesPage from "./components/DevicesPage";
import SchedulesPage from "./components/SchedulesPage";
import AutomationPage from "./components/AutomationPage";
import AnalyticsPage from "./components/AnalyticsPage";
import EnergySavingsPage from "./components/EnergySavingsPage";
import AlertsPage from "./components/AlertsPage";
import ReportsPage from "./components/ReportsPage";
import PlaceholderPage from "./components/PlaceholderPage";
import SignInPage from "./components/SignInPage";
import AdminProfilePage from "./components/AdminProfilePage";
import AssetManagementPage from "./components/AssetManagementPage";
import { buildings, getBuildingEmissionsKg, getBuildingConsumptionKwh } from "./data/buildings";

const DEFAULT_PROFILE = { name: "Admin User", role: "Super Administrator", email: "admin@campus.local" };

function getStoredProfile() {
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem("luntian-admin-profile") || "{}") };
  } catch {
    return DEFAULT_PROFILE;
  }
}

const totalCampusConsumptionKwh = buildings.reduce(
  (total, building) => total + getBuildingConsumptionKwh(building),
  0
);
const totalCampusEmissionsKg = buildings.reduce(
  (total, building) => total + getBuildingEmissionsKg(building),
  0
);

const dashboardStats = [
  { icon: Zap, iconBg: "#E8A317", label: "Total Electricity", value: "2,457 kW", sub: "Current Power" },
  { icon: Droplet, iconBg: "#4A8445", label: "Total Water", value: "76%", sub: "Average Tank Level" },
  { icon: Leaf, iconBg: "#31AFC5", label: "Carbon Emitted", value: `${(totalCampusEmissionsKg / 1000).toFixed(2)} tCO₂e`, sub: `${totalCampusConsumptionKwh.toLocaleString()} kWh today` },
  { icon: Plug, iconBg: "#22A559", label: "Smart Outlets", value: "247", sub: "Active Outlets" },
  { icon: AlertCircle, iconBg: "#E0432B", label: "Alerts", value: "7", sub: "Active Alerts" },
];

const PAGE_META = {
  dashboard: { title: "Dashboard" },
  "campus-overview": { title: "Campus Overview" },
  buildings: { title: "Buildings" },
  "water-overview": { title: "Water Overview" },
  "tank-monitoring": { title: "Tank Monitoring" },
  devices: { title: "Smart Outlets" },
  schedules: { title: "Schedules" },
  automation: { title: "Automation" },
  alerts: { title: "Alerts" },
  analytics: { title: "Analytics" },
  "energy-savings": { title: "Energy Savings" },
  reports: { title: "Reports" },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("luntian-admin-authenticated") === "true"
  );
  const [showSignIn, setShowSignIn] = useState(false);
  const [profile, setProfile] = useState(getStoredProfile);
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const navigate = (nextPage) => {
    if (nextPage === "asset-management" && !isAuthenticated) {
      setShowSignIn(true);
      return;
    }
    setPage(nextPage);
    if (nextPage !== "buildings") setSelectedBuilding(null);
  };

  const openBuilding = (name) => {
    setSelectedBuilding(name);
    setPage("building-detail");
  };

  const openProfile = () => setPage("admin-profile");

  const logout = () => {
    sessionStorage.removeItem("luntian-admin-authenticated");
    setIsAuthenticated(false);
    setPage("dashboard");
  };

  if (showSignIn) {
    return (
      <SignInPage
        onAuthenticated={() => {
          setIsAuthenticated(true);
          setShowSignIn(false);
        }}
        onCancel={() => setShowSignIn(false)}
      />
    );
  }

  // Build breadcrumb + title for the current page
  let breadcrumb = null;
  let title = PAGE_META[page]?.title || "";
  if (page === "building-detail") {
    title = selectedBuilding;
    breadcrumb = [{ label: "Buildings", onClick: () => navigate("buildings") }];
  }
  if (page === "admin-profile") title = "Admin Profile";

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:h-dvh lg:flex-row lg:overflow-hidden">
      <Sidebar
        activePage={page === "building-detail" ? "buildings" : page}
        onNavigate={navigate}
        isAuthenticated={isAuthenticated}
        onOpenProfile={openProfile}
        profile={profile}
      />

      <main className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden px-3 py-4 sm:px-4 lg:overflow-y-auto lg:p-6">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          rightLabel={page === "dashboard" ? "May 20, 2024" : undefined}
          isAuthenticated={isAuthenticated}
          onSignIn={() => setShowSignIn(true)}
        />

        {page === "dashboard" && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {dashboardStats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
            <div className="mb-5 flex flex-col gap-4 xl:flex-row">
              <ElectricityChart />
              <BreakdownDonut />
            </div>
            <div className="flex flex-col gap-4 xl:flex-row">
              <WaterTankStatus />
              <RecentAlerts />
            </div>
          </>
        )}

        {page === "campus-overview" && <CampusOverviewPage />}

        {page === "buildings" && <BuildingsPage onOpenBuilding={openBuilding} />}

        {page === "building-detail" && <BuildingDetailPage buildingName={selectedBuilding} />}

        {page === "water-overview" && <WaterOverviewPage onNavigate={navigate} />}

        {page === "tank-monitoring" && <TankMonitoringPage />}

        {page === "devices" && <DevicesPage />}

        {page === "schedules" && <SchedulesPage />}

        {page === "automation" && <AutomationPage />}

        {page === "alerts" && <AlertsPage />}

        {page === "analytics" && <AnalyticsPage />}

        {page === "energy-savings" && <EnergySavingsPage />}

        {page === "reports" && <ReportsPage />}

        {page === "admin-profile" && (
          <AdminProfilePage onProfileUpdated={setProfile} onLogout={logout} />
        )}

        {page === "asset-management" && isAuthenticated && <AssetManagementPage />}

      </main>
    </div>
  );
}
