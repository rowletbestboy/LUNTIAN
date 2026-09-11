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
} from "lucide-react";

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

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-navy text-ice">
      {/* Logo */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="flex items-center gap-3 px-5 py-5 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice text-sm font-bold text-navy">
          C
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-white">CAMPUS</div>
          <div className="text-[9px] tracking-wide text-faint">
            RESOURCE MANAGEMENT
          </div>
        </div>
      </button>

      <div className="mx-5 border-t border-navy-lighter" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((sec, i) => (
          <div key={i} className="mb-3">
            {sec.header && (
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold tracking-wide text-faint">
                {sec.header.toUpperCase()}
              </div>
            )}
            {sec.items.map(({ label, page, icon: Icon }) => {
              const isActive = page === activePage;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigate(page)}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-accent font-semibold text-white"
                      : "text-ice hover:bg-navy-light"
                  }`}
                >
                  <Icon size={16} strokeWidth={2} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2.5 bg-navy-light px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ice text-xs font-bold text-navy">
          A
        </div>
        <div>
          <div className="text-xs font-semibold text-white">Admin User</div>
          <div className="text-[10px] text-faint">Super Administrator</div>
        </div>
      </div>
    </aside>
  );
}
