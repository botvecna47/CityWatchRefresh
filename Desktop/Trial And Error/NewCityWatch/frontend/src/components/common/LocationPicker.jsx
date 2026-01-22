import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix for default Leaflet marker icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

// Component to center map
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || { lat: 21.1458, lng: 79.0882 }); // Nagpur default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    onLocationSelect(latlng);
    setError(null);
  };

  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setPosition(newPos);
        onLocationSelect(newPos);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="location-picker">
      <div className="map-container">
        <MapContainer 
          center={[position.lat, position.lng]} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              Selected Location <br /> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </Popup>
          </Marker>
          <MapEvents onLocationSelect={handleMapClick} />
          <RecenterMap lat={position.lat} lng={position.lng} />
        </MapContainer>
        
        <button 
          type="button" 
          className="locate-btn" 
          onClick={getUserLocation}
          disabled={loading}
          title="Use my location"
        >
          <Crosshair size={24} />
        </button>
      </div>

      <div className="location-info">
        <div className="coordinates">
          <MapPin size={16} className="text-primary" />
          <span>{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
        </div>
        {error && <span className="location-error">{error}</span>}
        {loading && <span className="location-loading">Getting location...</span>}
        <p className="location-hint">Click on map or use the locate button to pinpoint issue location</p>
      </div>
    </div>
  );
};

export default LocationPicker;
