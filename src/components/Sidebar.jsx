import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Droplets,
  Gauge,
  Activity,
  Plug,
  CalendarClock,
  Workflow,
  Bell,
  BarChart3,
  Leaf,
  FileBarChart,
  LockKeyhole,
} from "lucide-react";
import luntianLogo from "../assets/Luntian logo.png";

const PROTECTED_PAGES = new Set([
  "devices",
  "schedules",
  "automation",
  "alerts",
  "analytics",
  "energy-savings",
  "reports",
]);

// Each item maps to a page key that App.jsx knows how to render.
const SECTIONS = [
  {
    header: null,
    items: [{ label: "Dashboard", page: "dashboard", icon: LayoutDashboard }],
  },
  {
    header: "Electricity",
    items: [
      { label: "Campus Overview", page: "campus-overview", icon: Activity },
      { label: "Buildings", page: "buildings", icon: Building2 },
      { label: "Room Monitoring", page: "room-monitoring", icon: DoorOpen },
    ],
  },
  {
    header: "Water",
    items: [
      { label: "Water Overview", page: "water-overview", icon: Droplets },
      { label: "Tank Monitoring", page: "tank-monitoring", icon: Gauge },
      { label: "Consumption", page: "water-consumption", icon: Activity },
    ],
  },
  {
    header: "Smart Outlets",
    items: [
      { label: "Devices", page: "devices", icon: Plug },
      { label: "Schedules", page: "schedules", icon: CalendarClock },
      { label: "Automation", page: "automation", icon: Workflow },
    ],
  },
  {
    header: null,
    items: [
      { label: "Alerts", page: "alerts", icon: Bell },
      { label: "Analytics", page: "analytics", icon: BarChart3 },
      { label: "Energy Savings", page: "energy-savings", icon: Leaf },
      { label: "Reports", page: "reports", icon: FileBarChart },
    ],
  },
];

export default function Sidebar({ activePage, onNavigate, isAuthenticated, onRequestSignIn, onOpenProfile, profile }) {
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-navy text-ice">
      {/* Logo */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="flex items-center gap-3 px-5 py-5 text-left"
      >
        <img src={luntianLogo} alt="Luntian logo" className="h-9 w-9 rounded-lg object-contain" />
        <div>
          <div className="text-sm font-bold leading-tight text-white">LUNTIAN</div>
          <div className="text-[9px] tracking-wide text-faint">
            RESOURCE MANAGEMENT
          </div>
        </div>
      </button>

      <div className="mx-5 border-t border-navy-lighter" />

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((sec, i) => (
          <div key={i} className="mb-3">
            {sec.header && (
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold tracking-wide text-faint">
                {sec.header.toUpperCase()}
              </div>
            )}
            {sec.items.map(({ label, page, icon: Icon }) => {
              const isActive = page === activePage;
              const isLocked = !isAuthenticated && PROTECTED_PAGES.has(page);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => (isLocked ? onRequestSignIn() : onNavigate(page))}
                  title={isLocked ? "Admin sign in required" : undefined}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-accent font-semibold text-white"
                      : isLocked
                        ? "text-ice/55 hover:bg-navy-light hover:text-ice"
                        : "text-ice hover:bg-navy-light"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span className="flex-1">{label}</span>
                  {isLocked && <LockKeyhole size={13} className="text-faint" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {isAuthenticated && (
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-navy-light px-5 py-3.5 text-left transition-colors hover:bg-navy-lighter"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ice text-xs font-bold text-navy">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">{profile.name}</div>
            <div className="text-[10px] text-faint">{profile.role}</div>
          </div>
        </button>
      )}
    </aside>
  );
}
