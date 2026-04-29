import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, MapPin, Crosshair, ArrowRight, CheckCircle2, AlertTriangle, ArrowBigUp, Camera, X } from "lucide-react";
import { useAppContext, Report } from "../store";
import { Card, Button, Input, Textarea, cn } from "../components/ui";
import { motion } from "motion/react";
import { supabase } from "../supabase";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let icons: Record<string, L.DivIcon> | null = null;
const initLeaflet = () => {
  if (icons) return;
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  const createCustomIcon = (colorClass: string) => L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="relative w-8 h-8 -translate-x-1/2 -translate-y-full"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" class="lucide lucide-map-pin ${colorClass} drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32]
  });
  icons = { Reported: createCustomIcon('text-red-600') };
};

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} icon={icons?.Reported} draggable={true} eventHandlers={{ dragend: (e) => { const marker = e.target; setPosition([marker.getLatLng().lat, marker.getLatLng().lng]); } }} />;
}

const MAX_IMAGES = 5;

export function SubmitReport() {
  const { addReport, currentUser, reports, updateReport, areas, categories, refreshMasterData } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [locationLatLong, setLocationLatLong] = useState<[number, number]>([19.155, 77.307]); // Nanded default
  const [isClient, setIsClient] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [nearbyIssues, setNearbyIssues] = useState<Report[]>([]);

  // For upvoting a nearby issue with optional supporting photo
  const [upvotePhotoFile, setUpvotePhotoFile] = useState<File | null>(null);
  const [upvotePhotoPreview, setUpvotePhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    initLeaflet();
    setIsClient(true);
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const displayAreas = areas.length > 0 ? areas : [
    { id: 901, name: "Shivajinagar" },
    { id: 902, name: "Vazirabad" }
  ];

  const displayCategories = categories.length > 0 ? categories : [
    { id: 801, name: "POTHOLE" },
    { id: 802, name: "STREETLIGHT" },
    { id: 803, name: "GARBAGE" },
    { id: 804, name: "WATER_SUPPLY" }
  ];

  // Sync initial values when master data loads
  useEffect(() => {
    if (!area) setArea(displayAreas[0].name);
    if (!category) setCategory(displayCategories[0].name);
  }, [areas, categories]);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationLatLong([pos.coords.latitude, pos.coords.longitude]);
          setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
          setIsDetecting(false);
          // Don't auto advance, let the user verify the map
        },
        () => {
          // Fallback with Nanded center
          setLocation("Shivajinagar, Nanded");
          setLocationLatLong([19.155, 77.307]);
          setIsDetecting(false);
        }
      );
    } else {
      setLocation("Shivajinagar, Nanded");
      setIsDetecting(false);
    }
  };

  const handleConfirmLocation = async () => {
    // Safety-net: re-trigger master data fetch if not yet loaded
    if (areas.length === 0 || categories.length === 0) {
      await refreshMasterData();
    }
    const nearby = reports.filter(r => r.area === area && r.status !== "Completed").slice(0, 2);
    if (nearby.length > 0) {
      setNearbyIssues(nearby);
    } else {
      setStep(2);
    }
  };

  const handleUpvotePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpvotePhotoFile(file);
      setUpvotePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpvoteNearby = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      updateReport(id, { upvotes: report.upvotes + 1 });
      import("sonner").then(({ toast }) => toast.success("Your support has been recorded!"));
      navigate(`/report/${id}`);
    }
  };

  // ── Image handling for new complaint ──────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const available = MAX_IMAGES - images.length;
    if (available <= 0) {
      import("sonner").then(({ toast }) => toast.error("Maximum 5 images reached."));
      return;
    }

    const filesToAdd = files.slice(0, available);
    const newPreviews = filesToAdd.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...filesToAdd]);

    if (files.length > available) {
      import("sonner").then(({ toast }) =>
        toast.error(`Only ${available} slot(s) remaining. ${files.length - available} image(s) were not added.`)
      );
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsSubmitting(true);
    let uploadedUrls: string[] = [];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('citywatch-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          import("sonner").then(({ toast }) => toast.error('Failed to upload image'));
          continue;
        }

        const { data } = supabase.storage.from('citywatch-images').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
    }

    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category: category === "OTHER" ? (customCategory || "OTHER") : category,
      description,
      image: uploadedUrls.length > 0 ? uploadedUrls[0] : "",
      additionalImages: uploadedUrls.slice(1),
      locationText: location,
      lat: locationLatLong[0],
      lng: locationLatLong[1],
      area: (area === "OTHER" ? (customArea || "OTHER") : area) as any,
      status: "Reported",
      authorId: currentUser?.id || "u1",
      authorName: currentUser?.name || "Anonymous",
      authorAvatar: currentUser?.avatar || "",
      upvotes: 1,
      downvotes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      urgency: "Medium"
    };

    addReport(newReport);
    setIsSubmitting(false);
    import("sonner").then(({ toast }) => toast.success("Your complaint has been submitted!"));
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Report a Civic Issue</h1>
        <p className="text-gray-600 font-serif">Help improve Nanded by reporting problems in your area.</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        <StepIndicator num={1} active={step >= 1} label="Location" />
        <StepIndicator num={2} active={step >= 2} label="Details" />
        <StepIndicator num={3} active={step >= 3} label="Review" />
      </div>

      <Card className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm">

        {/* ── STEP 1: Location ─────────────────────────────────────────── */}
        {step === 1 && (
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
                <div className="w-full h-48 bg-gray-100 rounded-sm relative overflow-hidden border border-gray-200">
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

            {/* ── Nearby issues panel ───────────────────────────────────── */}
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
                      {nearbyIssues.map(issue => (
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

                          {/* ── Optional photo attachment on upvote ─── */}
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
        )}

        {/* ── STEP 2: Details ─────────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== "OTHER") setCustomCategory("");
                    }}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    {displayCategories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name.charAt(0) + c.name.slice(1).toLowerCase().replace(/_/g, ' ')}
                      </option>
                    ))}
                    <option value="OTHER">Other (Please specify)</option>
                  </select>
                  {category === "OTHER" && (
                    <Input
                      required
                      placeholder="Specify issue category..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">City Area</label>
                  <select
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      if (e.target.value !== "OTHER") setCustomArea("");
                    }}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    {displayAreas.map(a => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                    <option value="OTHER">Other (Please specify)</option>
                  </select>
                  {area === "OTHER" && (
                    <Input
                      required
                      placeholder="Specify city area..."
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Title</label>
                  <Input
                    required
                    placeholder="Briefly describe the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* ── Photo upload — max 5, only on new report ──────────── */}
              <div>
                <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">
                  Photo Evidence <span className="text-gray-400 font-normal">(Optional · max {MAX_IMAGES})</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-sm overflow-hidden border border-gray-200 h-24 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <div className={cn(
                      "border-2 border-dashed border-gray-300 rounded-sm h-24 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors bg-white group cursor-pointer",
                    )}>
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
              <Textarea
                required
                placeholder="Describe the issue in detail — location landmarks, severity, how long it has existed, and any hazards..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <div className="flex flex-col items-end gap-1">
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="gap-2"
                  disabled={!title || !description || (category === "OTHER" && !customCategory) || (area === "OTHER" && !customArea)}
                >
                  Review Details <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* ── STEP 3: Review ─────────────────────────────────────────── */}
        {step === 3 && (
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
                      {images.map((img, idx) => (
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
        )}
      </Card>
    </div>
  );
}

function StepIndicator({ num, active, label }: { num: number; active: boolean; label: string }) {
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
