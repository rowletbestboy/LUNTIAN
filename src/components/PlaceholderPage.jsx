import { Construction } from "lucide-react";

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white text-center">
      <Construction size={28} className="mb-3 text-faint" />
      <div className="text-sm font-semibold text-ink">{title} isn't built yet</div>
      <div className="mt-1 max-w-xs text-xs text-muted">
        This section doesn't have a design yet — it wasn't part of the original
        mockup. Tell me what it should show and I'll build it out.
      </div>
    </div>
  );
}
