import { useState } from "react";
import { ShieldAlert, Mail, Phone, MapPin, Briefcase, X, Check } from "lucide-react";
import { useAppContext } from "../../store";
import { Card, Button } from "../../components/ui";
import { toast } from "sonner";

export function ApplicationsManagement() {
  const { applications, updateApplicationStatus, areas } = useAppContext();
  const pendingApps = applications.filter(a => a.status === "pending");
  const [selectedAreas, setSelectedAreas] = useState<Record<string, number>>({});

  const handleApprove = (appId: string) => {
    const areaId = selectedAreas[appId];
    if (!areaId) {
      toast.error("Please select an area to assign this coordinator to.");
      return;
    }
    updateApplicationStatus(appId, "approved", areaId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#1A4331] font-serif">Pending Coordinator Applications</h2>
      {pendingApps.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          No pending applications to review.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingApps.map(app => (
            <Card key={app.id} className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-[#1A4331] text-2xl font-serif">{app.userName}</h3>
                  <div className="text-sm text-gray-500 mt-2 space-y-2 font-medium">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#2E7D32]" /> {app.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#2E7D32]" /> {app.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#2E7D32]" /> {app.address}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4" /> Relevant Experience
                  </h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">{app.experience}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Motivation Message</h4>
                  <p className="text-gray-700 text-sm bg-[#1A4331]/5 p-4 rounded-2xl border border-[#1A4331]/10 italic shadow-sm">"{app.message}"</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto pt-5 border-t border-gray-100">
                <div className="w-full sm:w-auto flex-1">
                  <select 
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-[#2E7D32] shadow-sm outline-none transition-all"
                    value={selectedAreas[app.id] || ""}
                    onChange={(e) => setSelectedAreas({...selectedAreas, [app.id]: Number(e.target.value)})}
                  >
                    <option value="" disabled>Select Area to Assign...</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => updateApplicationStatus(app.id, "rejected")} className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 h-12 rounded-xl font-bold px-6">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button onClick={() => handleApprove(app.id)} className="flex-1 sm:flex-none bg-[#1A4331] hover:bg-[#2E7D32] text-white h-12 rounded-xl font-bold px-6 shadow-md">
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
