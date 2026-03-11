import { useState } from "react";
import { mockReports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { MapPin, X, ChevronUp, MessageCircle } from "lucide-react";

const areas = ["All", "North Area", "South Area", "East Area"] as const;
const statuses = ["All", "Reported", "In Progress", "Completed"] as const;

const pinPositions: Record<string, { top: string; left: string }> = {
  "1": { top: "25%", left: "35%" },
  "2": { top: "60%", left: "55%" },
  "3": { top: "45%", left: "72%" },
  "4": { top: "30%", left: "20%" },
  "5": { top: "70%", left: "40%" },
  "6": { top: "50%", left: "80%" },
};

const statusColor: Record<string, string> = {
  "Reported": "bg-amber",
  "In Progress": "bg-accent",
  "Completed": "bg-forest",
};

const ReportMapPage = () => {
  const [areaFilter, setAreaFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = mockReports.filter((r) => {
    if (areaFilter !== "All" && r.area !== areaFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    return true;
  });

  const selectedReport = mockReports.find((r) => r.id === selected);

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-light via-cream-dark to-secondary">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Area zones */}
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[40%] rounded-3xl border-2 border-accent/20 bg-accent/5 flex items-start p-4">
          <span className="text-xs font-bold text-accent/40">NORTH AREA</span>
        </div>
        <div className="absolute top-[55%] left-[15%] w-[35%] h-[35%] rounded-3xl border-2 border-forest/20 bg-forest/5 flex items-start p-4">
          <span className="text-xs font-bold text-forest/40">SOUTH AREA</span>
        </div>
        <div className="absolute top-[20%] left-[55%] w-[35%] h-[55%] rounded-3xl border-2 border-amber/20 bg-amber/5 flex items-start p-4">
          <span className="text-xs font-bold text-amber/40">EAST AREA</span>
        </div>

        {/* Pins */}
        {filtered.map((r) => {
          const pos = pinPositions[r.id];
          if (!pos) return null;
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`absolute z-10 transition-all duration-300 hover:scale-125 ${
                selected === r.id ? "scale-125" : ""
              }`}
              style={{ top: pos.top, left: pos.left }}
            >
              <div className={`h-5 w-5 rounded-full ${statusColor[r.status]} shadow-lg ring-2 ring-card`} />
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-20">
        <div className="glass rounded-2xl p-2 flex flex-wrap gap-2">
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => setAreaFilter(a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                areaFilter === a ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="glass rounded-2xl p-2 flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s ? "bg-forest text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Popup card */}
      {selectedReport && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 animate-slide-up">
          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="relative">
              <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full h-36 object-cover" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-foreground text-sm mb-1">{selectedReport.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                {selectedReport.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className="text-[10px]">{selectedReport.status}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{selectedReport.area}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" /> {selectedReport.upvotes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {selectedReport.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportMapPage;
