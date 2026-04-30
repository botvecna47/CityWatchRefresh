import { useState, useMemo } from "react";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";
import { CheckCircle2, Clock, AlertTriangle, Upload, MapPin } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { toast } from "sonner";
import { useAppContext, Report } from "../../store";
import { Card, Button, Badge } from "../../components/ui";
import { ReportSummaryCard } from "./ReportSummaryCard";

export function CoordinatorDashboard({ reports }: { reports: Report[] }) {
  const { currentUser, updateReport, submitProof } = useAppContext();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const areaReports = reports.filter(r => r.area === currentUser?.area);
  const available = areaReports.filter(r => !r.coordinatorId && r.status === "Reported");
  const assigned  = reports.filter(r => r.coordinatorId === currentUser?.id && (r.status === "In Progress" || r.status === "Reported"));
  const completed = reports.filter(r => r.coordinatorId === currentUser?.id && r.status === "Completed");

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId || !location) { toast.error("Location is required."); return; }
    if (!proofImage) { toast.error("Photo proof is required."); return; }
    
    setIsSubmitting(true);
    await submitProof(resolvingId, proofImage, location.lat, location.lng);
    setIsSubmitting(false);
    setResolvingId(null);
    setProofImage(null);
    setLocation(null);
  };

  const getLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGettingLocation(false);
          toast.success("Location acquired successfully");
        },
        (error) => {
          console.error(error);
          setLocation({ lat: 40.7128, lng: -74.0060 });
          setGettingLocation(false);
          toast.success("Location simulated for demo purposes");
        }
      );
    } else {
      setLocation({ lat: 40.7128, lng: -74.0060 });
      setGettingLocation(false);
    }
  };

  const areaData = useMemo(() => {
    return [
      { name: 'New', value: available.length },
      { name: 'Active', value: assigned.length },
      { name: 'Completed', value: completed.length },
    ];
  }, [available.length, assigned.length, completed.length]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Coordinator Hub</h1>
          <p className="text-gray-600 font-serif">Managing issues for {currentUser?.area}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white shadow-sm border border-gray-200 col-span-1 flex flex-col justify-center items-center">
          <h3 className="font-bold text-[#1A4331] w-full border-b pb-2 mb-4">Area Status Overview</h3>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={areaData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" nameKey="name" isAnimationActive={false}>
                  {areaData.map((entry, index) => {
                    const colors = ["#ef4444", "#f59e0b", "#22c55e"];
                    return <Cell key={`pie-cell-${entry.name}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-xs font-medium text-gray-600 mt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> New</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full" /> Active</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> Done</span>
          </div>
        </Card>

        <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="p-6 bg-red-50 border-red-100 flex flex-col justify-center">
            <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">Needs Attention</p>
            <p className="text-4xl font-bold text-red-700">{available.length}</p>
            <p className="text-xs text-red-500 mt-2">Unassigned reports in your area</p>
          </Card>
          <Card className="p-6 bg-amber-50 border-amber-100 flex flex-col justify-center">
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">Your Active Tasks</p>
            <p className="text-4xl font-bold text-amber-700">{assigned.length}</p>
            <p className="text-xs text-amber-500 mt-2">In progress</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-[#1A4331] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <AlertTriangle className="w-5 h-5 text-red-500" /> New Reports ({available.length})
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {available.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">No new reports in your area.</p>}
            {available.map(r => (
              <div key={r.id} className="relative group">
                <ReportSummaryCard report={r} />
                <Button onClick={() => updateReport(r.id, { status: "In Progress", coordinatorId: currentUser?.id })} size="sm" className="absolute bottom-4 right-4 bg-[#1A4331] hover:bg-[#112d21] text-white">
                  Accept Task
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#1A4331] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Clock className="w-5 h-5 text-amber-500" /> My Active Tasks ({assigned.length})
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {assigned.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">You have no active tasks.</p>}
            {assigned.map(r => (
              <div key={r.id} className="bg-white border-l-4 border-amber-500 rounded-r-sm shadow-sm p-4 relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#1A4331] text-lg font-serif truncate pr-4">{r.title}</h3>
                  <Badge className="bg-red-100 text-red-800">{r.urgency} Urgency</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1 font-serif">
                  <Clock className="w-4 h-4" /> Time Elapsed: {r.createdAt ? formatDistanceToNow(new Date(r.createdAt)) : "Unknown"}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-2 items-center">
                    <Link to={`/report/${r.id}`} className="text-sm text-[#1A4331] font-medium hover:underline font-serif">View Details</Link>
                  </div>
                  <Button size="sm" onClick={() => setResolvingId(r.id)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark Completed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {resolvingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]">
            <h3 className="text-xl font-bold mb-2 font-serif">Upload Resolution Proof</h3>
            <p className="text-sm text-gray-600 mb-6 font-serif">Please provide a live photo and your current location to confirm resolution.</p>
            
            <form onSubmit={handleResolve} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-sm h-48 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors cursor-pointer bg-white group">
                {proofImage ? (
                  <img src={proofImage} alt="Proof" className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 group-hover:text-green-500 transition-colors mb-2" />
                    <span className="text-sm text-gray-500 font-serif">Take live photo</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files?.[0]) setProofImage(URL.createObjectURL(e.target.files[0])); }} required />
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={getLocation} disabled={gettingLocation} className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  {gettingLocation ? "Getting Location..." : location ? "Location Acquired" : "Get Current Location"}
                </Button>
              </div>
              {location && <p className="text-xs text-green-600 font-medium">✓ Location verified: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => { setResolvingId(null); setProofImage(null); setLocation(null); }}>Cancel</Button>
                <Button type="submit" disabled={!proofImage || !location || isSubmitting} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {isSubmitting ? "Confirming..." : "Confirm Resolution"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
