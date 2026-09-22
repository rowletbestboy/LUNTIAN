import { useMemo, useRef, useState } from "react";
import { Building2, Search, ChevronDown, LocateFixed, Map, Navigation } from "lucide-react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Card, StatusPill } from "./Card";

const CAMPUS_CENTER = [11.6603535, 125.4423667];

const buildings = [
  { name: "College of Engineering", category: "College", kwh: "1,284 kWh", pct: "76%", status: "Normal", coordinates: [11.6608, 125.4417] },
  { name: "College of Education", category: "College", kwh: "1,118 kWh", pct: "81%", status: "Normal", coordinates: [11.6606, 125.4422] },
  { name: "College of Business and Management", category: "College", kwh: "1,862 kWh", pct: "48%", status: "High Usage", coordinates: [11.6606, 125.4430] },
  { name: "College of Arts and Sciences", category: "College", kwh: "936 kWh", pct: "86%", status: "Normal", coordinates: [11.6602, 125.4416] },
  { name: "College of Nursing", category: "College", kwh: "742 kWh", pct: "78%", status: "Normal", coordinates: [11.6599, 125.4422] },
  { name: "ESSU College of Law", category: "College", kwh: "604 kWh", pct: "69%", status: "Normal", coordinates: [11.6610, 125.4432] },
  { name: "ESSU Chapel", category: "Faith and community", kwh: "188 kWh", pct: "92%", status: "Normal", coordinates: [11.6597, 125.4432] },
  { name: "Canuctan Hall", category: "Events and community", kwh: "496 kWh", pct: "73%", status: "Normal", coordinates: [11.6601, 125.4428] },
  { name: "Laboratory Building", category: "Research and instruction", kwh: "1,074 kWh", pct: "88%", status: "Normal", coordinates: [11.6597, 125.4417] },
  { name: "ESSU Library", category: "Student services", kwh: "612 kWh", pct: "89%", status: "Normal", coordinates: [11.6599, 125.4431] },
  { name: "Administration Building", category: "Administration", kwh: "1,420 kWh", pct: "64%", status: "Normal", coordinates: [11.6609, 125.4426] },
  { name: "University Pavilion", category: "Events and community", kwh: "356 kWh", pct: "71%", status: "Normal", coordinates: [11.6595, 125.4425] },
  { name: "Theatro Ibabawnon", category: "Arts and culture", kwh: "428 kWh", pct: "67%", status: "Normal", coordinates: [11.6603, 125.4435] },
  { name: "ESSU Gymnasium", category: "Sports and recreation", kwh: "368 kWh", pct: "71%", status: "Normal", coordinates: [11.6608, 125.4425] },
];

function ResetMapView({ mapRef }) {
  const map = useMap();
  mapRef.current = map;
  return null;
}

export default function BuildingsPage({ onOpenBuilding }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
  const mapRef = useRef(null);

  const filteredBuildings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return buildings.filter((building) => {
      const matchesSearch = !query || building.name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All Status" || building.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const chooseBuilding = (building) => setSelectedBuilding(building);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search building..."
            className="w-full rounded-full border border-border bg-white py-2 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>
        <label className="relative">
          <span className="sr-only">Filter buildings by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="appearance-none rounded-md border border-border bg-white py-2 pl-3 pr-8 text-sm text-ink outline-none"
          >
            <option>All Status</option>
            <option>Normal</option>
            <option>High Usage</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
        </label>
      </div>

      <Card className="mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <Map size={17} className="text-accent" />
              ESSU campus map
            </div>
            <p className="mt-1 text-xs text-muted">Navigate registered colleges, facilities, and campus landmarks.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            Live campus data
          </div>
        </div>

        <div className="relative h-[420px] overflow-hidden bg-[#E8F1E5] sm:h-[470px]">
          <MapContainer center={CAMPUS_CENTER} zoom={17} scrollWheelZoom className="h-full w-full">
            <ResetMapView mapRef={mapRef} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredBuildings.map((building) => {
              const isSelected = selectedBuilding.name === building.name;
              return (
                <CircleMarker
                  key={building.name}
                  center={building.coordinates}
                  radius={isSelected ? 12 : 9}
                  pathOptions={{ color: "#23452B", weight: 3, fillColor: isSelected ? "#4A8445" : "#A8CFA3", fillOpacity: 0.95 }}
                  eventHandlers={{ click: () => chooseBuilding(building) }}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <div className="font-bold text-[#1B2338]">{building.name}</div>
                              <div className="mt-1 text-xs text-[#8A93A8]">{building.category}</div>
                              <div className="text-xs text-[#8A93A8]">{building.kwh} today</div>
                      <button type="button" onClick={() => onOpenBuilding(building.name)} className="mt-2 rounded-md bg-[#4A8445] px-2.5 py-1.5 text-xs font-semibold text-white">Open details</button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          <button type="button" onClick={() => { mapRef.current?.setView(CAMPUS_CENTER, 17); setSelectedBuilding(buildings[0]); }} className="absolute bottom-4 right-4 z-[1000] flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-white">
            <LocateFixed size={14} className="text-accent" /> Reset view
          </button>
          <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted shadow-sm">
            <Navigation size={12} className="mr-1 inline text-accent" /> ESSU campus · Borongan
          </div>
        </div>

        {selectedBuilding && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-[#FAFCF9] px-5 py-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Selected building</div>
              <div className="mt-1 text-base font-bold text-ink">{selectedBuilding.name}</div>
              <div className="mt-0.5 text-xs text-muted">{selectedBuilding.category}</div>
            </div>
            <div className="flex items-center gap-4">
              <StatusPill status={selectedBuilding.status} />
              <button type="button" onClick={() => onOpenBuilding(selectedBuilding.name)} className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#376A34]">Open details</button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBuildings.map((b) => (
          <button
            key={b.name}
            onClick={() => { chooseBuilding(b); onOpenBuilding(b.name); }}
            className="text-left"
          >
            <Card className={`p-4 transition-shadow hover:shadow-md ${selectedBuilding.name === b.name ? "ring-2 ring-accent/30" : ""}`}>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ice">
                  <Building2 size={16} className="text-navy" />
                </div>
                <span>
                  <span className="block font-semibold text-ink">{b.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">{b.category}</span>
                </span>
              </div>
              <div className="text-xs text-muted">&darr; {b.kwh}</div>
              <div className="mt-1 text-xl font-bold text-ink">{b.pct}</div>
              <div className="mt-2">
                <StatusPill status={b.status} />
              </div>
            </Card>
          </button>
        ))}
      </div>
      {filteredBuildings.length === 0 && <div className="py-10 text-center text-sm text-muted">No buildings match your search.</div>}
    </div>
  );
}
