import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { MapPin, X, Layers, Filter } from "lucide-react";
import { useAppContext, Area, Status, Report } from "../store";
import { cn, Badge, Button } from "../components/ui";
import { StatusBadge } from "./Home";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let icons: Record<string, L.DivIcon> | null = null;

const initLeaflet = () => {
  if (icons) return;

  // Fix for default Leaflet icons
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  // Create custom colored markers for different statuses
  const createCustomIcon = (colorClass: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="relative w-8 h-8 -translate-x-1/2 -translate-y-full transition-transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin ${colorClass} drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <div class="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-current opacity-20 animate-ping"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  icons = {
    Completed: createCustomIcon('text-green-600'),
    'In Progress': createCustomIcon('text-amber-500'),
    Reported: createCustomIcon('text-red-600')
  };
};

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

export function MapPage() {
  const { reports } = useAppContext();
  const [activeArea, setActiveArea] = useState<Area | "All">("All");
  const [activeStatus, setActiveStatus] = useState<Status | "All">("All");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    initLeaflet();
    setIsClient(true);
  }, []);

  const filteredReports = reports.filter(r => {
    if (activeArea !== "All" && r.area !== activeArea) return false;
    if (activeStatus !== "All" && r.status !== activeStatus) return false;
    return true;
  });

  // Default center (San Francisco roughly)
  const defaultCenter: [number, number] = [37.7749, -122.4194];

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

        {filteredReports.map(report => (
          <Marker 
            key={report.id} 
            position={[report.lat, report.lng]}
            icon={icons[report.status]}
            eventHandlers={{
              click: () => setSelectedReport(report),
            }}
          >
            {/* We handle Popup externally for styling freedom, but could use <Popup> here too */}
          </Marker>
        ))}
      </MapContainer>

      {/* Glassmorphic Filters Overlay */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-auto z-10 flex flex-col gap-4 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-sm shadow-sm border border-white/50 w-full sm:w-72 pointer-events-auto">
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
        
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-sm shadow-sm border border-white/50 hidden sm:flex items-center gap-3 w-72 pointer-events-auto">
          <Layers className="w-5 h-5 text-[#1A4331]" />
          <div>
            <p className="text-sm font-bold text-[#1A4331] font-serif leading-none">Map View Active</p>
            <p className="text-xs text-gray-500 font-serif mt-1">Showing {filteredReports.length} issues dynamically bridged</p>
          </div>
        </div>
      </div>

      {/* Selected Report Custom Popup Overlay */}
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
