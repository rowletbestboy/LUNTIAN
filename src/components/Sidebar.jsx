import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
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
  Settings2,
  Menu,
  X,
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
  "asset-management",
]);

// Each item maps to a page key that App.jsx knows how to render.
const SECTIONS = [
  {
    header: "Administration",
    items: [{ label: "Asset Management", page: "asset-management", icon: Settings2 }],
  },
  {
    header: null,
    items: [{ label: "Dashboard", page: "dashboard", icon: LayoutDashboard }],
  },
  {
    header: "Electricity",
    items: [
      { label: "Campus Overview", page: "campus-overview", icon: Activity },
      { label: "Buildings", page: "buildings", icon: Building2 },
    ],
  },
  {
    header: "Water",
    items: [
      { label: "Water Overview", page: "water-overview", icon: Droplets },
      { label: "Tank Monitoring", page: "tank-monitoring", icon: Gauge },
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

function Brand({ onNavigate }) {
  return (
    <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-3 px-5 py-5 text-left">
      <img src={luntianLogo} alt="Luntian logo" className="h-9 w-9 rounded-lg object-contain" />
      <div>
        <div className="text-sm font-bold leading-tight text-white">LUNTIAN</div>
        <div className="text-[9px] tracking-wide text-faint">RESOURCE MANAGEMENT</div>
      </div>
    </button>
  );
}

function Navigation({ activePage, onNavigate, isAuthenticated }) {
  return (
    <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
      {SECTIONS.map((section, index) => {
        const visibleItems = section.items.filter(
          ({ page }) => isAuthenticated || !PROTECTED_PAGES.has(page)
        );
        if (!visibleItems.length) return null;

        return (
          <div key={index} className="mb-3">
            {section.header && (
              <div className="px-2 pb-1 pt-2 text-[10px] font-bold tracking-wide text-faint">
                {section.header.toUpperCase()}
              </div>
            )}
            {visibleItems.map(({ label, page, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate(page)}
                className={`mb-0.5 flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                  page === activePage ? "bg-accent font-semibold text-white" : "text-ice hover:bg-navy-light"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function ProfileButton({ isAuthenticated, profile, onOpenProfile }) {
  if (!isAuthenticated) return null;
  return (
    <button type="button" onClick={onOpenProfile} className="flex items-center gap-2.5 bg-navy-light px-5 py-3.5 text-left transition-colors hover:bg-navy-lighter">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ice text-xs font-bold text-navy">{profile.name.charAt(0).toUpperCase()}</div>
      <div>
        <div className="text-xs font-semibold text-white">{profile.name}</div>
        <div className="text-[10px] text-faint">{profile.role}</div>
      </div>
    </button>
  );
}

export default function Sidebar({ activePage, onNavigate, isAuthenticated, onOpenProfile, profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = (page) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-navy text-ice lg:flex">
        <Brand onNavigate={navigate} />
        <div className="mx-5 border-t border-navy-lighter" />
        <Navigation activePage={activePage} onNavigate={navigate} isAuthenticated={isAuthenticated} />
        <ProfileButton isAuthenticated={isAuthenticated} profile={profile} onOpenProfile={onOpenProfile} />
      </aside>

      <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between bg-navy px-3 text-ice shadow-sm lg:hidden">
        <Brand onNavigate={navigate} />
        <button type="button" aria-label="Open navigation menu" onClick={() => setIsOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-navy-light">
          <Menu size={21} />
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation menu" onClick={() => setIsOpen(false)} className="absolute inset-0 h-full w-full bg-black/45" />
          <aside className="absolute inset-y-0 left-0 flex h-dvh w-[min(18rem,88vw)] flex-col bg-navy text-ice shadow-2xl animate-[slide-in_.2s_ease-out]">
            <div className="flex items-center justify-between pr-3">
              <Brand onNavigate={navigate} />
              <button type="button" aria-label="Close navigation menu" onClick={() => setIsOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-navy-light"><X size={19} /></button>
            </div>
            <div className="mx-5 border-t border-navy-lighter" />
            <Navigation activePage={activePage} onNavigate={navigate} isAuthenticated={isAuthenticated} />
            <ProfileButton isAuthenticated={isAuthenticated} profile={profile} onOpenProfile={() => { onOpenProfile(); setIsOpen(false); }} />
          </aside>
        </div>
      )}
    </>
  );
}
