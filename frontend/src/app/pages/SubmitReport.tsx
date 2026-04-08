import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, MapPin, Crosshair, ArrowRight, CheckCircle2, AlertTriangle, ArrowBigUp } from "lucide-react";
import { useAppContext, Report } from "../store";
import { Card, Button, Input, Textarea, cn } from "../components/ui";
import { motion } from "motion/react";
import { supabase } from "../supabase";

export function SubmitReport() {
  const { addReport, currentUser, reports, updateReport } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [nearbyIssues, setNearbyIssues] = useState<Report[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("North Area");
  const [category, setCategory] = useState("Infrastructure");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setLocation("123 Main St, Near Central Square");
      setIsDetecting(false);
      
      // Mock finding nearby issues (within 50m radius)
      const nearby = reports.filter(r => r.area === "North Area" && r.status !== "Completed").slice(0, 1);
      if (nearby.length > 0) {
        setNearbyIssues(nearby);
      } else {
        setStep(2);
      }
    }, 1500);
  };

  const handleUpvoteNearby = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      updateReport(id, { upvotes: report.upvotes + 1 });
      navigate(`/report/${id}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 5 - images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      const newImages = filesToAdd.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
      setImageFiles(prev => [...prev, ...filesToAdd]);
      
      if (files.length > remainingSlots) {
        import("sonner").then(({ toast }) => {
          toast.error(`Maximum 5 images allowed. Only added ${remainingSlots} images.`);
        });
      }
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
    
    // Upload files to Supabase citywatch-images bucket
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('citywatch-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          import("sonner").then(({ toast }) => toast.error('Failed to upload image'));
          continue;
        }

        const { data } = supabase.storage
          .from('citywatch-images')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(data.publicUrl);
      }
    }

    const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop";

    // Call API (using mock store for now, but API wired)
    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      image: mainImageUrl, // Real URL!
      additionalImages: uploadedUrls.slice(1),
      locationText: location,
      lat: 40.7128 + (Math.random() - 0.5) * 0.01,
      lng: -74.0060 + (Math.random() - 0.5) * 0.01,
      area: area as any,
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
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Report a Civic Issue</h1>
        <p className="text-gray-600 font-serif">Help improve our city by reporting problems in your area.</p>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
        <StepIndicator num={1} active={step >= 1} label="Location" />
        <StepIndicator num={2} active={step >= 2} label="Details" />
        <StepIndicator num={3} active={step >= 3} label="Review" />
      </div>

      <Card className="p-6 md:p-8 bg-white border border-gray-100 shadow-sm">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Where is the issue?</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter street address or drag map pin..." 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 border-[#1A4331]/20 focus:ring-[#2E7D32]"
                />
                <Button onClick={handleDetectLocation} variant="secondary" className="gap-2 border border-[#1A4331]/20 bg-[#FDFDF7] text-[#1A4331] hover:bg-gray-100 whitespace-nowrap" disabled={isDetecting}>
                  {isDetecting ? <span className="animate-pulse">Detecting...</span> : <><Crosshair className="w-4 h-4" /> Detect My Location</>}
                </Button>
              </div>
            </div>

            {location && (
              <div className="w-full h-48 bg-gray-100 rounded-sm relative overflow-hidden border border-gray-200 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546087812-89cbb3e6e8a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwbWFwJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzczMzA3NTQ5fDA&ixlib=rb-4.1.0&q=80&w=800')] bg-cover bg-center opacity-50 grayscale mix-blend-multiply"></div>
                <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-sm shadow-sm font-medium text-[#1A4331] flex items-center gap-2 border border-[#1A4331]/10">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" /> {location}
                </div>
              </div>
            )}

            {nearbyIssues.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-sm shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-2 font-serif">Similar Issues Found Nearby (Within 50m)</h3>
                    <p className="text-sm text-amber-800 mb-4 font-serif">Before submitting a new report, check if your issue has already been reported. Upvoting existing issues helps us prioritize them faster.</p>
                    
                    <div className="space-y-3">
                      {nearbyIssues.map(issue => (
                        <div key={issue.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-sm border border-amber-100 shadow-sm gap-3">
                          <div>
                            <p className="font-semibold text-amber-900 text-sm font-serif">{issue.title}</p>
                            <p className="text-xs text-amber-700 font-serif">{issue.locationText}</p>
                          </div>
                          <Button onClick={() => handleUpvoteNearby(issue.id)} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white gap-2 text-xs py-1 h-8 w-full sm:w-auto">
                            <ArrowBigUp className="w-4 h-4" /> Upvote Instead
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200 flex justify-end">
                  <Button onClick={() => { setNearbyIssues([]); setStep(2); }} variant="ghost" className="text-amber-800 hover:bg-amber-100 hover:text-amber-900 font-serif w-full sm:w-auto">
                    Skip, mine is different
                  </Button>
                </div>
              </motion.div>
            )}

            {!nearbyIssues.length && location && (
              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} className="gap-2">Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Issue Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option>Infrastructure (Potholes, Sidewalks)</option>
                    <option>Sanitation (Trash, Graffiti)</option>
                    <option>Utilities (Streetlights, Water)</option>
                    <option>Public Safety</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">City Area</label>
                  <select 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option value="North Area">North Area</option>
                    <option value="South Area">South Area</option>
                    <option value="East Area">East Area</option>
                    <option value="West Area">West Area</option>
                  </select>
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

              <div>
                <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Photo Evidence (Optional, max 5)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-sm overflow-hidden border border-gray-200 h-24 group">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-sm h-24 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors bg-white group cursor-pointer">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#2E7D32] transition-colors mb-1" />
                      <span className="text-xs text-gray-500 font-serif">Add Photo</span>
                      <input type="file" accept="image/*" capture="environment" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{images.length}/5 images uploaded</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A4331] mb-2 font-serif">Detailed Description</label>
              <Textarea 
                required
                placeholder="Provide any additional details that might help coordinators resolve this issue..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" onClick={() => setStep(3)} className="gap-2" disabled={!title || !description}>Review Details <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-gray-50 p-6 rounded-sm border border-gray-200">
              <h3 className="text-xl font-bold text-[#1A4331] mb-4 font-serif border-b border-gray-200 pb-2">Review Your Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p><strong className="text-gray-700 font-serif">Title:</strong> {title}</p>
                  <p><strong className="text-gray-700 font-serif">Location:</strong> {location}</p>
                  <p><strong className="text-gray-700 font-serif">Area:</strong> {area}</p>
                  <p><strong className="text-gray-700 font-serif">Category:</strong> {category}</p>
                  <p><strong className="text-gray-700 font-serif">Description:</strong> <br/><span className="text-gray-600 font-serif">{description}</span></p>
                </div>
                {images.length > 0 && (
                  <div>
                    <strong className="text-gray-700 block mb-2 font-serif">Images Attached ({images.length}):</strong>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {images.map((img, idx) => (
                        <img key={idx} src={img} alt={`Preview ${idx+1}`} className="w-full h-24 object-cover rounded-sm border border-gray-300 shadow-sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>Edit Details</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 bg-[#1A4331] hover:bg-[#112d21] text-white">
                <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? "Uploading..." : "Submit Report"}
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
