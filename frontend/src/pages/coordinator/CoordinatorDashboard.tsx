import { useState } from "react";
import { mockReports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Upload, CheckCircle2, MapPin, AlertTriangle, X } from "lucide-react";

const assigned = mockReports.filter((r) => r.status !== "Completed");
const completed = mockReports.filter((r) => r.status === "Completed");

const getUrgencyColor = (time: string) => {
  if (time.includes("hour")) return "text-destructive";
  if (time.includes("day")) return "text-amber";
  return "text-muted-foreground";
};

const CoordinatorDashboard = () => {
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);

  const resolveReport = mockReports.find((r) => r.id === resolveId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Coordinator Dashboard</h1>
        <p className="text-muted-foreground">North Area — Manage assigned issues</p>
      </div>

      {/* Kanban-style columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber" />
            <h2 className="text-lg font-bold text-foreground">Active ({assigned.length})</h2>
          </div>
          <div className="space-y-4">
            {assigned.map((r) => (
              <div key={r.id} className="card-premium p-4 animate-fade-in hover-lift">
                <div className="flex gap-3">
                  <img src={r.imageUrl} alt={r.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm truncate">{r.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {r.location}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-[10px]">{r.status}</Badge>
                      <span className={`flex items-center gap-1 text-xs font-medium ${getUrgencyColor(r.timestamp)}`}>
                        <Clock className="h-3 w-3" /> {r.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                  onClick={() => { setResolveId(r.id); setProofUploaded(false); }}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Mark as Resolved
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Completed ({completed.length})</h2>
          </div>
          <div className="space-y-4">
            {completed.map((r) => (
              <div key={r.id} className="card-premium p-4 opacity-80 animate-fade-in">
                <div className="flex gap-3">
                  <img src={r.imageUrl} alt={r.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm truncate">{r.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {r.location}
                    </div>
                    <Badge className="text-[10px] mt-2 bg-forest/10 text-forest border border-forest/30">Completed</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {resolveReport && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setResolveId(null)}>
          <div className="glass-strong rounded-2xl p-6 w-[90%] max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Resolve Issue</h3>
              <button onClick={() => setResolveId(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{resolveReport.title}</p>

            <div
              className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center hover:border-accent/40 transition-colors cursor-pointer mb-4"
              onClick={() => setProofUploaded(true)}
            >
              {proofUploaded ? (
                <div className="flex items-center justify-center gap-2 text-accent">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Proof photo uploaded</span>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Upload proof/after photo</p>
                  <p className="text-xs text-muted-foreground">Click to upload</p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setResolveId(null)}>Cancel</Button>
              <Button
                className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={!proofUploaded}
                onClick={() => setResolveId(null)}
              >
                Confirm Resolution
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
