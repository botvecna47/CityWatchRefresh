import { useState } from "react";
import { mockReports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, FileText } from "lucide-react";

const citizenReports = mockReports.slice(0, 3);

const CitizenDashboard = () => {
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Track your submitted reports and rate coordinators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Submitted", value: "3", icon: FileText },
          { label: "In Progress", value: "1", icon: Clock },
          { label: "Resolved", value: "1", icon: Star },
        ].map((s) => (
          <div key={s.label} className="card-premium p-5 text-center animate-fade-in">
            <s.icon className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reports */}
      <h2 className="text-lg font-bold text-foreground mb-4">Your Reports</h2>
      <div className="space-y-4">
        {citizenReports.map((r) => (
          <div key={r.id} className="card-premium p-4 flex gap-4 animate-fade-in hover-lift">
            <img src={r.imageUrl} alt={r.title} className="w-24 h-24 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm truncate">{r.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" /> {r.location}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="text-[10px]">{r.status}</Badge>
                <Badge variant="secondary" className="text-[10px]">{r.area}</Badge>
              </div>
              {r.status === "Completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-lg text-xs gap-1 border-accent/30 text-accent hover:bg-accent/10"
                  onClick={() => { setRatingTarget(r.id); setRating(0); }}
                >
                  <Star className="h-3 w-3" /> Rate Coordinator
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rating Modal */}
      {ratingTarget && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setRatingTarget(null)}>
          <div className="glass-strong rounded-2xl p-6 w-[90%] max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-2">Rate Coordinator</h3>
            <p className="text-sm text-muted-foreground mb-6">How would you rate the resolution of this issue?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      s <= (hoverRating || rating) ? "fill-amber text-amber" : "text-border"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setRatingTarget(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setRatingTarget(null)}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
