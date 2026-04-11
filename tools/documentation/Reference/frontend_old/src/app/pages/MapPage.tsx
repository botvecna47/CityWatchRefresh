import { useState, useMemo } from "react";
import { Link } from "react-router";
import { MapPin, X, Layers, Filter } from "lucide-react";
import { useAppContext, Area, Status, Report } from "../store";
import { cn, Button } from "../components/ui";
import { StatusBadge } from "./Home";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createCustomIcon = (status: Status, isSelected: boolean) => {
  const colorClass = status === 'Completed' ? 'text-green-600' : status === 'In Progress' ? 'text-amber-500' : 'text-red-600';
  const scaleClass = isSelected ? 'scale-[1.2] z-50' : 'scale-100 z-10';
  const pulseHtml = isSelected ? `<div class="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full opacity-20 animate-ping ${colorClass.replace('text-', 'bg-')}"></div>` : '';
  
  const html = `
    <div class="relative transition-all duration-300 transform ${scaleClass}">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin drop-shadow-lg ${colorClass}">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15.002 4 10a8 8 0 0 1 16 0"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      ${pulseHtml}
    </div>
  `;

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: html,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

export function MapPage() {
  const { reports } = useAppContext();
  const [activeArea, setActiveArea] = useState<Area | "All">("All");
  const [activeStatus, setActiveStatus] = useState<Status | "All">("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (activeArea !== "All" && r.area !== activeArea) return false;
      if (activeStatus !== "All" && r.status !== activeStatus) return false;
      return true;
    });
  }, [reports, activeArea, activeStatus]);

  // Center of New York based on the mock data
  const centerPosition: [number, number] = [40.7128, -74.0060];

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] rounded-sm overflow-hidden bg-[#e5e3df] border border-gray-200 shadow-sm flex">
      {/* Glassmorphic Filters Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-4 max-h-[calc(100%-2rem)] overflow-y-auto w-64 sm:w-72 custom-scrollbar">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-sm shadow-md border border-white/50 w-full">
          <h3 className="text-sm font-bold text-[#1A4331] mb-3 flex items-center gap-2 font-serif uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filter Map
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-serif">By Area</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["All", "North Area", "South Area", "East Area", "West Area"].map((area) => (
                  <button
                    key={area}
                    onClick={() => setActiveArea(area as any)}
                    className={cn(
                      "px-2 sm:px-3 py-1 text-xs font-medium rounded-sm border transition-colors font-serif",
                      activeArea === area 
                        ? "bg-[#1A4331] text-white border-[#1A4331]" 
                        : "bg-white/70 text-[#1A4331] border-gray-200 hover:bg-white"
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-serif">By Status</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {["All", "Reported", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status as any)}
                    className={cn(
                      "px-2 sm:px-3 py-1 text-xs font-medium rounded-sm border transition-colors font-serif",
                      activeStatus === status 
                        ? "bg-[#2E7D32] text-white border-[#2E7D32]" 
                        : "bg-white/70 text-[#1A4331] border-gray-200 hover:bg-white"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-sm shadow-md border border-white/50 flex items-center gap-3 w-full">
          <Layers className="w-5 h-5 text-[#1A4331]" />
          <div>
            <p className="text-sm font-bold text-[#1A4331] font-serif leading-none">Interactive Map Active</p>
            <p className="text-xs text-gray-500 font-serif mt-1">Showing {filteredReports.length} issues</p>
          </div>
        </div>
      </div>

      {/* Real React-Leaflet Map Container */}
      <div className="w-full h-full z-0 relative">
        <MapContainer 
          center={centerPosition} 
          zoom={13} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles grayscale contrast-125 opacity-70 sepia-[.2]" // Premium styling
          />

          {filteredReports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={createCustomIcon(report.status, selectedReport?.id === report.id)}
              eventHandlers={{
                click: () => setSelectedReport(report),
              }}
            >
              <Popup className="custom-popup" closeButton={false} offset={[0, 10]}>
                {/* We render an invisible popup just as an anchor and use our own floating card below */}
                <div className="hidden"></div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Selected Report Floating Popup (Custom UI instead of standard leaflet popup) */}
      {selectedReport && (
        <div className="absolute bottom-6 right-6 z-[500] w-72 sm:w-80 bg-white shadow-2xl rounded-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="relative h-32 bg-gray-100">
            <img src={selectedReport.image} alt="Issue" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={selectedReport.status} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{selectedReport.area}</span>
            </div>
            
            <h4 className="font-bold text-[#1A4331] text-lg mb-1.5 line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedReport.title}</h4>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-serif leading-relaxed">{selectedReport.description}</p>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1 font-serif font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-500" /> {selectedReport.locationText.split(',')[0]}
              </span>
              <Link to={`/report/${selectedReport.id}`}>
                <Button size="sm" className="h-8 text-xs py-0 bg-[#1A4331] hover:bg-[#112d21] text-white font-serif rounded-sm px-4">
                  View Detail
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Internal Custom CSS for Map adjustments */}
      <style>{`
        .leaflet-container {
          background-color: #e5e3df;
        }
        .leaflet-bottom.leaflet-right {
          display: none; /* Hide default attributions to use custom area */
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
        }
        .custom-popup .leaflet-popup-tip-container {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}
