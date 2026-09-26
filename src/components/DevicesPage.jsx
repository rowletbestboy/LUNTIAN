import { useState } from "react";
import { ArrowLeft, Building2, ChevronRight, DoorOpen, Plug } from "lucide-react";
import { Card, PanelHeader } from "./Card";
import { buildings, roomsByBuilding } from "../data/buildings";

export default function DevicesPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const rooms = selectedBuilding ? roomsByBuilding[selectedBuilding] || [] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => { setSelectedBuilding(null); setSelectedRoom(null); }}
            className={`font-semibold ${selectedBuilding ? "text-accent hover:underline" : "text-ink"}`}
          >
            Buildings
          </button>
          {selectedBuilding && (
            <>
              <ChevronRight size={14} className="text-muted" />
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className={`truncate font-semibold ${selectedRoom ? "text-accent hover:underline" : "text-ink"}`}
              >
                {selectedBuilding}
              </button>
            </>
          )}
          {selectedRoom && (
            <>
              <ChevronRight size={14} className="text-muted" />
              <span className="font-semibold text-ink">{selectedRoom.name}</span>
            </>
          )}
        </div>
        {(selectedBuilding || selectedRoom) && (
          <button
            type="button"
            onClick={() => selectedRoom ? setSelectedRoom(null) : setSelectedBuilding(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            <ArrowLeft size={15} /> Back
          </button>
        )}
      </div>

      {!selectedBuilding && (
        <Card>
          <PanelHeader title="REGISTERED BUILDINGS" />
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {buildings.map((building) => (
              <button
                key={building.name}
                type="button"
                onClick={() => setSelectedBuilding(building.name)}
                className="flex min-h-14 items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:border-accent/50 hover:bg-canvas"
              >
                <Building2 size={17} className="shrink-0 text-accent" />
                <span className="flex-1 text-sm font-semibold text-ink">{building.name}</span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedBuilding && !selectedRoom && (
        <Card>
          <PanelHeader title="ROOMS" />
          <div className="divide-y divide-border px-5">
            {rooms.map((room) => (
              <button
                key={room.name}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className="flex w-full items-center gap-3 py-4 text-left hover:text-accent"
              >
                <DoorOpen size={17} className="shrink-0 text-accent" />
                <span className="flex-1 text-sm font-medium text-ink">{room.name}</span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </button>
            ))}
            {rooms.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">No registered rooms for this building.</p>
            )}
          </div>
        </Card>
      )}

      {selectedRoom && (
        <Card className="max-w-xl">
          <PanelHeader title="REGISTERED SMART SOCKETS" />
          <div className="flex items-center gap-4 px-5 py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ice text-accent">
              <Plug size={22} />
            </div>
            <div>
              <div className="text-sm text-muted">{selectedBuilding} / {selectedRoom.name}</div>
              <div className="mt-1 text-3xl font-bold text-ink">{selectedRoom.smartSockets}</div>
              <div className="text-sm text-muted">smart sockets registered</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
