import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import LiveDashboardPage from "./components/LiveDashboardPage";
import BuildingsPage from "./components/BuildingsPage";
import WaterOverviewPage from "./components/WaterOverviewPage";
import TankMonitoringPage from "./components/TankMonitoringPage";
import DevicesPage from "./components/DevicesPage";
import SchedulesPage from "./components/SchedulesPage";
import LiveAnalyticsPage from "./components/LiveAnalyticsPage";
import LiveAlertsPage from "./components/LiveAlertsPage";
import LiveReportsPage from "./components/LiveReportsPage";
import LiveEnergySavingsPage from "./components/LiveEnergySavingsPage";
import LiveAutomationPage from "./components/LiveAutomationPage";
import NoReadingsPage from "./components/NoReadingsPage";
import SignInPage from "./components/SignInPage";
import AdminProfilePage from "./components/AdminProfilePage";
import AssetManagementPage from "./components/AssetManagementPage";
import { supabase } from "./lib/supabase";

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
  const [user, setUser] = useState(null);
  const isAuthenticated = Boolean(user);
  const [showSignIn, setShowSignIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));

    return () => subscription.unsubscribe();
  }, []);

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

  const logout = async () => {
    await supabase?.auth.signOut();
    setPage("dashboard");
  };

  const profile = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Administrator",
    role: user?.app_metadata?.role || "Administrator",
    email: user?.email || "",
  };

  if (showSignIn) {
    return (
      <SignInPage
        onAuthenticated={() => {
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
          isAuthenticated={isAuthenticated}
          onSignIn={() => setShowSignIn(true)}
        />

        {page === "dashboard" && <LiveDashboardPage userId={user?.id} />}

        {page === "campus-overview" && <NoReadingsPage title="No campus electricity readings" detail="The connected demo device does not measure electricity consumption. Campus energy metrics will appear when compatible meters are connected." />}

        {page === "buildings" && <BuildingsPage onOpenBuilding={openBuilding} />}

        {page === "building-detail" && <NoReadingsPage title={`${selectedBuilding} · no readings`} detail="No electricity meter is connected to this building yet." />}

        {page === "water-overview" && <WaterOverviewPage userId={user?.id} onNavigate={navigate} />}

        {page === "tank-monitoring" && <TankMonitoringPage userId={user?.id} />}

        {page === "devices" && <DevicesPage userId={user?.id} />}

        {page === "schedules" && <SchedulesPage userId={user?.id} />}

        {page === "automation" && <LiveAutomationPage userId={user?.id} />}

        {page === "alerts" && <LiveAlertsPage userId={user?.id} />}

        {page === "analytics" && <LiveAnalyticsPage userId={user?.id} />}

        {page === "energy-savings" && <LiveEnergySavingsPage />}

        {page === "reports" && <LiveReportsPage userId={user?.id} />}

        {page === "admin-profile" && user && (
          <AdminProfilePage user={user} onProfileUpdated={setUser} onLogout={logout} />
        )}

        {page === "asset-management" && user && <AssetManagementPage userId={user.id} />}

      </main>
    </div>
  );
}
