import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppContext, Report } from "../store";
import { Card } from "../components/ui";
import { storageClient } from "../storageClient";
import {
  initLeaflet, StepIndicator, LocationStep, DetailsStep, ReviewStep
} from "../components/submit-report/SubmitReportSteps";
import 'leaflet/dist/leaflet.css';

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
    if (!area && displayAreas.length > 0) setArea(displayAreas[0].name);
    if (!category && displayCategories.length > 0) setCategory(displayCategories[0].name);
  }, [areas, categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Geolocation ──────────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocationLatLong([lat, lng]);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              const addressParts = [];
              if (data.address.suburb || data.address.neighbourhood) addressParts.push(data.address.suburb || data.address.neighbourhood);
              if (data.address.city || data.address.town) addressParts.push(data.address.city || data.address.town);
              const detectedAddress = addressParts.length > 0 ? addressParts.join(', ') : data.display_name.split(',').slice(0, 2).join(', ');
              setLocation(detectedAddress);
              const matchedArea = displayAreas.find((a: any) =>
                data.display_name.toLowerCase().includes(a.name.toLowerCase()) ||
                detectedAddress.toLowerCase().includes(a.name.toLowerCase())
              );
              if (matchedArea) setArea(matchedArea.name);
            } else {
              setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
          } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
          setIsDetecting(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          import("sonner").then(({ toast }) => toast.error("Location access denied. Please type your location manually."));
          setIsDetecting(false);
        }
      );
    } else {
      import("sonner").then(({ toast }) => toast.error("Geolocation is not supported by this browser."));
      setIsDetecting(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (areas.length === 0 || categories.length === 0) {
      await refreshMasterData();
    }

    // Use Haversine distance to find truly nearby issues (within 500m of the pin)
    const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const [userLat, userLng] = locationLatLong;
    const nearby = reports
      .filter(r =>
        r.status !== "Completed" &&
        r.lat != null &&
        r.lng != null &&
        haversineKm(userLat, userLng, r.lat, r.lng) <= 0.5
      )
      .slice(0, 2);

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
    if (!title || !description) {
      import("sonner").then(({ toast }) => toast.error("Title and description are required."));
      return;
    }
    if (description.length < 10) {
      import("sonner").then(({ toast }) => toast.error("Description must be at least 10 characters long."));
      return;
    }

    setIsSubmitting(true);
    let uploadedUrls: string[] = [];

    // Upload any attached images to Supabase storage
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await storageClient.storage
        .from('citywatch-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        import("sonner").then(({ toast }) => toast.error('Failed to upload image. Please try again.'));
        setIsSubmitting(false);
        return;
      }

      const { data } = storageClient.storage.from('citywatch-images').getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category: category === "OTHER" ? (customCategory || "OTHER") : category,
      description,
      image: uploadedUrls.length > 0 ? uploadedUrls[0] : "",
      additionalImages: uploadedUrls.slice(1),
      locationText: location || `${locationLatLong[0].toFixed(5)}, ${locationLatLong[1].toFixed(5)}`,
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Report a Civic Issue</h1>
        <p className="text-gray-600 font-serif">Help improve Nanded by reporting problems in your area.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        <StepIndicator num={1} active={step >= 1} label="Location" />
        <StepIndicator num={2} active={step >= 2} label="Details" />
        <StepIndicator num={3} active={step >= 3} label="Review" />
      </div>

      <Card className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm">
        {step === 1 && (
          <LocationStep
            location={location} setLocation={setLocation} locationLatLong={locationLatLong}
            setLocationLatLong={setLocationLatLong} isDetecting={isDetecting} handleDetectLocation={handleDetectLocation}
            isClient={isClient} nearbyIssues={nearbyIssues} handleUpvoteNearby={handleUpvoteNearby}
            upvotePhotoPreview={upvotePhotoPreview} handleUpvotePhotoChange={handleUpvotePhotoChange}
            setUpvotePhotoFile={setUpvotePhotoFile} setUpvotePhotoPreview={setUpvotePhotoPreview}
            setNearbyIssues={setNearbyIssues} setStep={setStep} handleConfirmLocation={handleConfirmLocation}
          />
        )}

        {step === 2 && (
          <DetailsStep
            category={category} setCategory={setCategory} displayCategories={displayCategories}
            customCategory={customCategory} setCustomCategory={setCustomCategory}
            area={area} setArea={setArea} displayAreas={displayAreas}
            customArea={customArea} setCustomArea={setCustomArea}
            title={title} setTitle={setTitle} images={images} MAX_IMAGES={MAX_IMAGES}
            removeImage={removeImage} handleImageUpload={handleImageUpload}
            description={description} setDescription={setDescription} setStep={setStep}
          />
        )}

        {step === 3 && (
          <ReviewStep
            title={title} location={location} area={area} customArea={customArea}
            category={category} customCategory={customCategory} description={description}
            images={images} MAX_IMAGES={MAX_IMAGES} setStep={setStep}
            handleSubmit={handleSubmit} isSubmitting={isSubmitting}
          />
        )}
      </Card>
    </div>
  );
}
