import { motion } from "motion/react";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Crosshair, AlertTriangle, MapPin, ArrowBigUp, Camera, X, Upload, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Input, Textarea, cn } from "../../components/ui";
import { Report } from "../../store";
import L from 'leaflet';

let icons: Record<string, L.DivIcon> | null = null;
export const initLeaflet = () => {
  if (icons) return;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  const createCustomIcon = (colorClass: string) => L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="relative w-8 h-8"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" class="lucide lucide-map-pin ${colorClass} drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32]
  });
  icons = { Reported: createCustomIcon('text-red-600') };
};

export function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return <Marker position={position} icon={icons?.Reported} draggable={true} eventHandlers={{ dragend: (e) => { const marker = e.target; setPosition([marker.getLatLng().lat, marker.getLatLng().lng]); } }} />;
}

export function StepIndicator({ num, active, label }: { num: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[#FDFDF7] px-2">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
        active ? "bg-[#2E7D32] border-[#2E7D32] text-white shadow-sm" : "bg-white border-gray-300 text-gray-400"
      )}>
        {num}
      </div>
      <span className={cn("text-xs font-semibold uppercase tracking-wider font-serif", active ? "text-[#1A4331]" : "text-gray-400")}>{label}</span>
    </div>
  );
}

export function LocationStep({ 
  location, setLocation, locationLatLong, setLocationLatLong, isDetecting, handleDetectLocation, 
  isClient, nearbyIssues, handleUpvoteNearby, upvotePhotoPreview, handleUpvotePhotoChange, 
  setUpvotePhotoFile, setUpvotePhotoPreview, setNearbyIssues, setStep, handleConfirmLocation 
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Where is the issue?</label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter street address or detect location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 border-[#1A4331]/20 focus:ring-[#2E7D32]"
          />
          <Button onClick={handleDetectLocation} variant="secondary" className="gap-2 border border-[#1A4331]/20 bg-[#FDFDF7] text-[#1A4331] hover:bg-gray-100 whitespace-nowrap" disabled={isDetecting}>
            {isDetecting ? <span className="animate-pulse">Detecting...</span> : <><Crosshair className="w-4 h-4" /> My Location</>}
          </Button>
        </div>
      </div>

      {location && isClient && (
        <div>
          <p className="text-xs text-amber-600 mb-2 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Pinpoint accuracy is important. You can drag the pin or click on the map to adjust your exact location.
          </p>
          <div className="w-full h-80 min-h-[300px] max-h-[50vh] bg-gray-100 rounded-sm relative overflow-hidden border border-gray-200">
            <MapContainer center={locationLatLong} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker position={locationLatLong} setPosition={setLocationLatLong} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-sm shadow-sm font-medium text-[#1A4331] flex items-center gap-2 border border-[#1A4331]/10 text-xs">
              <MapPin className="w-4 h-4 text-[#2E7D32]" /> {locationLatLong[0].toFixed(5)}, {locationLatLong[1].toFixed(5)}
            </div>
          </div>
        </div>
      )}

      {nearbyIssues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-sm shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 mb-1 font-serif">Similar Issue Found Nearby</h3>
              <p className="text-sm text-amber-800 mb-4 font-serif">
                The following issue has already been reported nearby. Upvoting it increases its priority and helps coordinators address it faster. You may also attach a supporting photo.
              </p>

              <div className="space-y-4">
                {nearbyIssues.map((issue: Report) => (
                  <div key={issue.id} className="bg-white p-4 rounded-sm border border-amber-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-amber-900 text-sm font-serif">{issue.title}</p>
                        <p className="text-xs text-amber-700 font-serif flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {issue.locationText}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleUpvoteNearby(issue.id)}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white gap-2 text-xs py-1 h-8 w-full sm:w-auto"
                      >
                        <ArrowBigUp className="w-4 h-4" /> Upvote
                      </Button>
                    </div>

                    <div className="border-t border-amber-100 pt-3">
                      <p className="text-xs text-amber-800 font-medium mb-2 font-serif flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        Optionally attach a supporting photo to strengthen this complaint
                      </p>
                      {upvotePhotoPreview ? (
                        <div className="relative w-24 h-20 rounded overflow-hidden border border-amber-200 group">
                          <img src={upvotePhotoPreview} alt="Upvote photo" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => { setUpvotePhotoFile(null); setUpvotePhotoPreview(null); }}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed border-amber-300 rounded text-xs text-amber-700 cursor-pointer hover:bg-amber-50 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Add Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleUpvotePhotoChange} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200 flex justify-end">
            <Button onClick={() => { setNearbyIssues([]); setStep(2); }} variant="ghost" className="text-amber-800 hover:bg-amber-100 font-serif">
              Mine is different — continue filing
            </Button>
          </div>
        </motion.div>
      )}

      {!nearbyIssues.length && location && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleConfirmLocation} className="gap-2 bg-[#1A4331] hover:bg-[#112d21] text-white">Confirm Location & Continue <ArrowRight className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

export function DetailsStep({
  category, setCategory, displayCategories, customCategory, setCustomCategory,
  area, setArea, displayAreas, customArea, setCustomArea,
  title, setTitle, images, MAX_IMAGES, removeImage, handleImageUpload,
  description, setDescription, setStep
}: any) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Issue Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); if (e.target.value !== "OTHER") setCustomCategory(""); }}
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              {displayCategories.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name.charAt(0) + c.name.slice(1).toLowerCase().replace(/_/g, ' ')}</option>
              ))}
              <option value="OTHER">Other (Please specify)</option>
            </select>
            {category === "OTHER" && (
              <Input required placeholder="Specify issue category..." value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="mt-2" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Title</label>
            <Input required placeholder="Briefly describe the issue" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">
            Photo Evidence <span className="text-gray-400 font-normal">(Optional · max {MAX_IMAGES})</span>
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((img: string, idx: number) => (
              <div key={idx} className="relative rounded-sm overflow-hidden border border-gray-200 h-24 group">
                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <div className={cn("border-2 border-dashed border-gray-300 rounded-sm h-24 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors bg-white group cursor-pointer")}>
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#2E7D32] transition-colors mb-1" />
                <span className="text-xs text-gray-500 font-serif">Add Photo</span>
                <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {images.length}/{MAX_IMAGES} photos added
            {images.length >= MAX_IMAGES && <span className="text-amber-600 ml-1">· Limit reached</span>}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Detailed Description</label>
        <Textarea required placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <div className="flex flex-col items-end gap-1">
          <Button type="button" onClick={() => setStep(3)} className="gap-2" disabled={!title || !description || (category === "OTHER" && !customCategory)}>
            Review Details <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ReviewStep({
  title, location, area, customArea, category, customCategory, description, images, MAX_IMAGES, setStep, handleSubmit, isSubmitting
}: any) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-gray-50 p-6 rounded-sm border border-gray-200">
        <h3 className="text-xl font-bold text-[#1A4331] mb-4 font-serif border-b border-gray-200 pb-2">Review Your Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <p><strong className="text-gray-700 font-serif">Title:</strong> {title}</p>
            <p><strong className="text-gray-700 font-serif">Location:</strong> {location}</p>
            <p><strong className="text-gray-700 font-serif">Area:</strong> {area === "OTHER" ? customArea : area}</p>
            <p><strong className="text-gray-700 font-serif">Category:</strong> {(category === "OTHER" ? customCategory : category).replace("_", " ")}</p>
            <p><strong className="text-gray-700 font-serif">Description:</strong><br /><span className="text-gray-600 font-serif">{description}</span></p>
          </div>
          {images.length > 0 && (
            <div>
              <strong className="text-gray-700 block mb-2 font-serif text-sm">Photos Attached ({images.length}/{MAX_IMAGES}):</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-sm border border-gray-300 shadow-sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={() => setStep(2)}>Edit Details</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-[#1A4331] hover:bg-[#112d21] text-white">
          <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </div>
    </div>
  );
}
