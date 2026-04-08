import { useState } from "react";
import { Link } from "react-router";
import { MapPin, X, Layers, Filter } from "lucide-react";
import { useAppContext, Area, Status, Report } from "../store";
import { cn, Badge, Button } from "../components/ui";
import { StatusBadge } from "./Home";

export function MapPage() {
  const { reports } = useAppContext();
  const [activeArea, setActiveArea] = useState<Area | "All">("All");
  const [activeStatus, setActiveStatus] = useState<Status | "All">("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(r => {
    if (activeArea !== "All" && r.area !== activeArea) return false;
    if (activeStatus !== "All" && r.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-sm overflow-hidden bg-[#e5e3df] border border-gray-200 shadow-sm">
      {/* Mock Map Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546087812-89cbb3e6e8a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzczMzA3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1600')] bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"></div>

      {/* Grid Overlay for Mock Map Feel */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(26,67,49,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,67,49,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Glassmorphic Filters */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-sm shadow-sm border border-white/50 w-72">
          <h3 className="text-sm font-bold text-[#1A4331] mb-3 flex items-center gap-2 font-serif uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filter Map
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-serif">By Area</label>
              <div className="flex flex-wrap gap-2">
                {["All", "North Area", "South Area", "East Area", "West Area"].map((area) => (
                  <button
                    key={area}
                    onClick={() => setActiveArea(area as any)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-sm border transition-colors font-serif",
                      activeArea === area 
                        ? "bg-[#1A4331] text-white border-[#1A4331]" 
                        : "bg-white/50 text-[#1A4331] border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-serif">By Status</label>
              <div className="flex flex-wrap gap-2">
                {["All", "Reported", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status as any)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-sm border transition-colors font-serif",
                      activeStatus === status 
                        ? "bg-[#2E7D32] text-white border-[#2E7D32]" 
                        : "bg-white/50 text-[#1A4331] border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-sm shadow-sm border border-white/50 flex items-center gap-3 w-72">
          <Layers className="w-5 h-5 text-[#1A4331]" />
          <div>
            <p className="text-sm font-bold text-[#1A4331] font-serif leading-none">Map View Active</p>
            <p className="text-xs text-gray-500 font-serif mt-1">Showing {filteredReports.length} issues</p>
          </div>
        </div>
      </div>

      {/* Mock Map Pins */}
      {filteredReports.map((report, i) => {
        // Simple mock positioning
        const top = `${20 + (i * 15) % 60}%`;
        const left = `${30 + (i * 25) % 50}%`;
        
        const isSelected = selectedReport?.id === report.id;

        return (
          <div key={report.id} className="absolute" style={{ top, left }}>
            <button 
              onClick={() => setSelectedReport(report)}
              className={cn(
                "group relative -translate-x-1/2 -translate-y-full transition-transform hover:scale-110",
                isSelected ? "scale-110 z-20" : "z-10"
              )}
            >
              <MapPin className={cn("w-10 h-10 drop-shadow-md", report.status === 'Completed' ? 'text-green-600' : report.status === 'In Progress' ? 'text-amber-500' : 'text-red-600')} fill="white" />
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-current opacity-20 animate-ping"></div>
            </button>
          </div>
        );
      })}

      {/* Selected Report Popup */}
      {selectedReport && (
        <div className="absolute bottom-6 right-6 z-30 w-80 bg-white shadow-xl rounded-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative h-32 bg-gray-100">
            <img src={selectedReport.image} alt="Issue" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={selectedReport.status} />
              <span className="text-xs font-semibold text-gray-500 font-serif">{selectedReport.area}</span>
            </div>
            
            <h4 className="font-bold text-[#1A4331] mb-1 line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedReport.title}</h4>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-serif">{selectedReport.description}</p>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1 font-serif">
                <MapPin className="w-3 h-3 text-red-500" /> {selectedReport.locationText.split(',')[0]}
              </span>
              <Link to={`/report/${selectedReport.id}`}>
                <Button size="sm" className="h-8 text-xs py-0 bg-[#1A4331] hover:bg-[#112d21] text-white font-serif rounded-sm">View Detail</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
