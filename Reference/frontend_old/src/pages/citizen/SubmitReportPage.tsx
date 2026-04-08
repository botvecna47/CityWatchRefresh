import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, Send, CheckCircle2, Image as ImageIcon } from "lucide-react";

const categories = ["Roads", "Lighting", "Sanitation", "Water", "Sidewalks", "Vandalism", "Parks", "Other"];

const SubmitReportPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center animate-scale-in">
        <div className="h-20 w-20 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Report Submitted!</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Thank you for contributing to your community. Your report has been received and will be assigned to a coordinator shortly.
        </p>
        <Button onClick={() => setSubmitted(false)} className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
          Submit Another Report
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Submit a Report</h1>
        <p className="text-muted-foreground">Help improve your city by reporting civic issues</p>
      </div>

      <div className="card-premium p-6 md:p-8 space-y-6 animate-fade-in">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Issue Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Upload Photo</label>
          <div
            className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-accent/40 transition-colors cursor-pointer"
            onClick={() => {
              setImagePreview("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&q=80");
            }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            ) : (
              <>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Location</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter address or use detection"
              className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
            <Button variant="outline" className="rounded-xl gap-2 border-border hover:bg-muted/50 shrink-0">
              <MapPin className="h-4 w-4" /> Detect
            </Button>
          </div>
          <div className="mt-3 h-32 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Map preview will appear here</p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  category === c
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed information about the issue..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all resize-none"
          />
        </div>

        <Button
          onClick={() => setSubmitted(true)}
          className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold shadow-lg shadow-accent/20"
        >
          <Send className="h-4 w-4 mr-2" /> Submit Report
        </Button>
      </div>
    </div>
  );
};

export default SubmitReportPage;
