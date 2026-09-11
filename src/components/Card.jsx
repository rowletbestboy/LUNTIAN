export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-xl border border-border bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, right }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <h2 className="text-sm font-bold tracking-wide text-ink">{title}</h2>
      {right}
    </div>
  );
}

export function StatCard({ icon: Icon, iconBg, label, value, sub }) {
  return (
    <Card className="p-4">
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={16} />
      </div>
      <div className="text-[10px] font-bold tracking-wide text-muted">
        {label.toUpperCase()}
      </div>
      <div className="mt-1 text-xl font-bold text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{sub}</div>
    </Card>
  );
}

export function StatusPill({ status }) {
  const map = {
    Normal: { dot: "bg-ok", text: "text-muted" },
    "High Usage": { dot: "bg-warn", text: "text-muted" },
    Critical: { dot: "bg-crit", text: "text-muted" },
    Offline: { dot: "bg-faint", text: "text-muted" },
  };
  const s = map[status] || map.Normal;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      <span className={s.text}>{status}</span>
    </span>
  );
}
