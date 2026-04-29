import React, { useState, useEffect } from "react";
import { MapPin, X, Layers, Filter } from "lucide-react";
import { useAppContext, Area, Status, Report } from "../store";
import { cn, Button } from "../components/ui";
import { StatusBadge } from "./Home";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function MapUpdater({ reports }: { reports: Report[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map((r: Report) => [r.lat, r.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
}

const urgencyColor = (urgency: string) => {
  if (urgency === "High")   return { fill: "#ef4444", stroke: "#b91c1c" };
  if (urgency === "Medium") return { fill: "#f59e0b", stroke: "#b45309" };
  return                           { fill: "#3b82f6", stroke: "#1d4ed8" };
};

export function MapPage() {
  const { reports, setSelectedReportId } = useAppContext();
  const [activeArea, setActiveArea] = useState<Area | "All">(localStorage.getItem("map_filterArea") || "All");
  const [activeStatus, setActiveStatus] = useState<Status | "All">((localStorage.getItem("map_filterStatus") as Status | "All") || "All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    localStorage.setItem("map_filterArea", activeArea);
    localStorage.setItem("map_filterStatus", activeStatus);
  }, [activeArea, activeStatus]);

  const filteredReports = reports.filter(r => {
    if (activeArea !== "All" && r.area !== activeArea) return false;
    if (activeStatus !== "All" && r.status !== activeStatus) return false;
    return true;
  });

  const defaultCenter: [number, number] = [19.1383, 77.3210];
  const availableAreas = ["All", ...Array.from(new Set(reports.map(r => r.area).filter(Boolean)))];

  if (!isClient) return null;

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-sm overflow-hidden bg-[#e5e3df] border border-gray-200 shadow-sm">
      
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater reports={filteredReports} />

        {filteredReports.map(report => {
          const { fill, stroke } = urgencyColor(report.urgency);
          const radius = report.urgency === "High" ? 13 : report.urgency === "Medium" ? 9 : 7;
          return (
            <CircleMarker
              key={report.id}
              center={[report.lat, report.lng]}
              radius={radius}
              fillColor={fill}
              color={stroke}
              weight={2}
              fillOpacity={0.85}
              eventHandlers={{ click: () => setSelectedReport(report) }}
            />
          );
        })}
      </MapContainer>

      {/* Filters Overlay */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-auto z-10 flex flex-col gap-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-sm shadow-sm border border-white/50 w-full sm:w-72 pointer-events-auto">
          <h3 className="text-sm font-bold text-[#1A4331] mb-3 flex items-center gap-2 font-serif uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filter Map
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-serif">By Area</label>
              <select
                value={activeArea}
                onChange={(e) => setActiveArea(e.target.value as Area | "All")}
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#1A4331] text-[#1A4331] font-serif cursor-pointer shadow-sm"
              >
                {availableAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
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
        
        {/* Legend */}
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-sm shadow-sm border border-white/50 hidden sm:flex items-center gap-4 w-72 pointer-events-auto">
          <Layers className="w-4 h-4 text-[#1A4331] flex-shrink-0" />
          <div className="flex items-center gap-3 text-xs font-serif font-medium text-gray-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Low</span>
          </div>
          <span className="ml-auto text-[10px] text-gray-400">{filteredReports.length} issues</span>
        </div>
      </div>

      {/* Selected Report Popup */}
      {selectedReport && (
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-30 sm:w-80 bg-white shadow-2xl rounded-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          <div className="relative h-32 bg-gray-100">
            <img src={selectedReport.image} alt="Issue" className="w-full h-full object-cover" />
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Urgency badge on image */}
            <span className={cn(
              "absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-sm border",
              selectedReport.urgency === "High" ? "bg-red-100 text-red-700 border-red-200" :
              selectedReport.urgency === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
              "bg-blue-100 text-blue-700 border-blue-200"
            )}>
              {selectedReport.urgency} Urgency
            </span>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={selectedReport.status} />
              <span className="text-xs font-semibold text-gray-500 font-serif">{selectedReport.area}</span>
            </div>
            
            <h4 className="font-bold text-[#1A4331] mb-1 line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedReport.title}</h4>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-serif">{selectedReport.description}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1 font-serif">
                <MapPin className="w-3 h-3 text-red-500" /> {selectedReport.locationText.split(',')[0]}
              </span>
              <Button 
                onClick={() => setSelectedReportId(selectedReport.id)} 
                size="sm" 
                className="h-8 text-xs py-0 bg-[#1A4331] hover:bg-[#112d21] text-white font-serif rounded-sm"
              >
                View Detail
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



