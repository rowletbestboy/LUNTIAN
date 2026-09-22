import { Calendar, LockKeyhole } from "lucide-react";

/**
 * breadcrumb: array of { label, onClick? } — last item is the current page (not clickable).
 */
export default function TopBar({ title, breadcrumb, rightLabel, statusPill, isAuthenticated, onSignIn }) {
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
        {!isAuthenticated && (
          <button
            type="button"
            onClick={onSignIn}
            className="flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#376A34]"
          >
            <LockKeyhole size={15} />
            Sign in
          </button>
        )}
        {isAuthenticated && (
          <span className="rounded-lg border border-[#CFE2CC] bg-[#F1F8F0] px-3.5 py-2 text-sm font-semibold text-accent">
            Admin access
          </span>
        )}
      </div>
    </div>
  );
}
