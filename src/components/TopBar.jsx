import { Bell, Calendar, Maximize2 } from "lucide-react";

/**
 * breadcrumb: array of { label, onClick? } — last item is the current page (not clickable).
 */
export default function TopBar({ title, breadcrumb, rightLabel, statusPill }) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-faint">/</span>}
                {b.onClick ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-accent hover:underline"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span>{b.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
          {statusPill}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightLabel && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-ink">
            <Calendar size={15} className="text-muted" />
            {rightLabel}
          </div>
        )}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink">
          <Bell size={16} />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-crit" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-ink">
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}
