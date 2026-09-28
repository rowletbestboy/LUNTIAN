import { Activity } from "lucide-react";
import { Card } from "./Card";

export default function NoReadingsPage({ title, detail = "No live readings have been received for this section yet." }) {
  return (
    <Card className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-muted">
        <Activity size={20} />
      </span>
      <h2 className="mt-3 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{detail}</p>
    </Card>
  );
}
