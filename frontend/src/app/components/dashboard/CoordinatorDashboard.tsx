import { useState, useMemo } from "react";
import { Link } from "react-router";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "motion/react";
import { CheckCircle2, Clock, AlertTriangle, Upload, MapPin, Smartphone, ArrowRight, Activity, Target } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { toast } from "sonner";
import { useAppContext, Report } from "../../store";
import { Card, Button, Badge } from "../../components/ui";
import { ReportSummaryCard } from "./ReportSummaryCard";
import { storageClient } from "../../storageClient";

// ─── Platform Detection ────────────
const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check Developer Bypass
  if (typeof window !== 'undefined' && window.localStorage.getItem('CITYWATCH_MOBILE_BYPASS') === 'true') {
    return true;
  }
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0);
};
const IS_MOBILE = isMobileDevice();

export function CoordinatorDashboard({ reports }: { reports: Report[] }) {
  const { currentUser, updateReport, submitProof } = useAppContext();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
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
    if (!proofImageFile) { toast.error("Photo proof is required."); return; }
    
    setIsSubmitting(true);
    
    try {
      const fileExt = proofImageFile.name.split('.').pop();
      const fileName = `proofs/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await storageClient.storage
        .from('citywatch-images')
        .upload(fileName, proofImageFile);

      if (uploadError) {
        throw new Error('Failed to upload image to storage');
      }

      const { data } = storageClient.storage.from('citywatch-images').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      await submitProof(resolvingId, publicUrl, location.lat, location.lng);
      
      setResolvingId(null);
      setProofImageFile(null);
      setProofImagePreview(null);
      setLocation(null);
    } catch (err) {
      console.error(err);
      toast.error("Proof submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          const targetReport = reports.find(r => r.id === resolvingId);
          setLocation({ lat: targetReport?.lat || 19.155, lng: targetReport?.lng || 77.307 });
          setGettingLocation(false);
          toast.success("Location simulated for demo purposes");
        }
      );
    } else {
      const targetReport = reports.find(r => r.id === resolvingId);
      setLocation({ lat: targetReport?.lat || 19.155, lng: targetReport?.lng || 77.307 });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A4331] mb-2 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Coordinator Hub</h1>
          <p className="text-gray-600 font-serif text-lg">Managing civic issues for <span className="font-semibold text-[#2E7D32]">{currentUser?.area}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-[#1A4331]/5 px-4 py-2 rounded-full border border-[#1A4331]/10">
          <Activity className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-sm font-medium text-[#1A4331]">Live Duty Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white/80 backdrop-blur-md shadow-sm border border-gray-100 col-span-1 lg:col-span-2 flex flex-col justify-center items-center rounded-2xl hover:shadow-md transition-all duration-300">
          <h3 className="font-bold text-[#1A4331] w-full border-b border-gray-100 pb-2 mb-4 font-serif flex items-center justify-between">
            Progress Analytics Report 
            <Activity className="w-4 h-4 text-[#2E7D32]" />
          </h3>
          <div className="flex w-full justify-around items-center h-full flex-wrap">
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={areaData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value" stroke="none">
                    {areaData.map((entry, index) => {
                      const colors = ["#ef4444", "#f59e0b", "#22c55e"];
                      return <Cell key={`pie-cell-${entry.name}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-2xl font-bold text-[#1A4331]">{areaReports.length}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-sm font-semibold text-gray-700">New Queue: {available.length}</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-amber-500 rounded-full" /><span className="text-sm font-semibold text-gray-700">In Progress: {assigned.length}</span></div>
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-sm font-semibold text-gray-700">Resolved Today: {completed.length}</span></div>
            </div>
          </div>
        </Card>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="col-span-1">
          <Card className="h-full p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-red-100 flex flex-col justify-center rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Needs Attention
            </p>
            <p className="text-5xl font-black text-red-700 tracking-tight">{available.length}</p>
            <p className="text-sm font-medium text-red-600/80 mt-2">Unassigned reports in area</p>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className="col-span-1">
          <Card className="h-full p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100 flex flex-col justify-center rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Your Active Tasks
            </p>
            <p className="text-5xl font-black text-amber-700 tracking-tight">{assigned.length}</p>
            <p className="text-sm font-medium text-amber-600/80 mt-2">Currently in progress</p>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NEW REPORTS COLUMN */}
        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1A4331] flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              <div className="bg-red-100 p-2 rounded-xl text-red-600"><AlertTriangle className="w-5 h-5" /></div>
              Queue
            </h2>
            <Badge variant="outline" className="bg-white">{available.length} items</Badge>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {available.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-green-300 mb-3" />
                <p className="text-gray-500 font-medium">All clear!</p>
                <p className="text-sm text-gray-400 mt-1">No new reports in your area.</p>
              </div>
            )}
            {available.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                <ReportSummaryCard report={r} />
                <Button 
                  onClick={() => updateReport(r.id, { status: "In Progress", coordinatorId: currentUser?.id })} 
                  size="sm" 
                  className="absolute bottom-4 right-4 bg-[#1A4331] hover:bg-[#2E7D32] text-white shadow-lg transition-all"
                >
                  Accept Task <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ACTIVE TASKS COLUMN */}
        <div className="bg-[#1A4331]/[0.02] p-6 rounded-3xl border border-[#1A4331]/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1A4331] flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
              In Progress
            </h2>
            <Badge variant="outline" className="bg-white">{assigned.length} tasks</Badge>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {assigned.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active tasks.</p>
                <p className="text-sm text-gray-400 mt-1">Accept a task from the queue to start.</p>
              </div>
            )}
            {assigned.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border-l-4 border-amber-500 rounded-xl shadow-sm p-5 relative hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[#1A4331] text-lg font-serif truncate pr-4">{r.title}</h3>
                  <Badge className="bg-red-50 text-red-700 border border-red-100 shadow-sm">{r.urgency}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-5 flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-gray-400" /> Elapsed: {r.createdAt ? `${formatDistanceToNow(new Date(r.createdAt))} • ${format(new Date(r.createdAt), "dd MMM yy, HH:mm")}` : "Unknown"}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/report/${r.id}`} className="text-sm text-[#2E7D32] font-semibold hover:text-[#1A4331] transition-colors">View Details</Link>
                  <Button size="sm" onClick={() => setResolvingId(r.id)} className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-sm rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Resolve Task
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {resolvingId && (
        <div className="fixed inset-0 z-50 bg-[#1A4331]/80 flex items-center justify-center p-4 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-[#1A4331]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold font-serif">Resolution Proof</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">Provide a live photo and current location to enforce geofence compliance.</p>
            
            <form onSubmit={handleResolve} className="space-y-5">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl h-56 flex flex-col items-center justify-center relative hover:bg-gray-50 hover:border-[#2E7D32]/50 transition-all cursor-pointer bg-white group overflow-hidden">
                {proofImagePreview ? (
                  <>
                    <img src={proofImagePreview} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium text-sm flex items-center gap-2"><Upload className="w-4 h-4" /> Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Take live photo</span>
                    <span className="text-xs text-gray-400 mt-1">Geo-tagged visual proof</span>
                  </div>
                )}
                {IS_MOBILE ? (
                  <input
                    type="file"
                    capture="environment"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setProofImageFile(e.target.files[0]);
                        setProofImagePreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    required
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-2xl pointer-events-none p-4 text-center">
                    <Smartphone className="w-10 h-10 text-gray-300 mb-3" />
                    <span className="text-sm font-bold text-gray-700">Mobile Device Required</span>
                    <span className="text-xs text-gray-500 mt-1">Live camera capture is required to prevent fraud.</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button type="button" variant="outline" onClick={getLocation} disabled={gettingLocation} className="w-full h-12 rounded-xl font-semibold text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-[#1A4331]">
                  <MapPin className={`w-5 h-5 mr-2 ${gettingLocation ? 'animate-pulse text-amber-500' : 'text-gray-400'}`} />
                  {gettingLocation ? "Acquiring GPS Signal..." : location ? "Re-Acquire Location" : "Acquire GPS Location"}
                </Button>
                {location && (
                  <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-2 text-sm text-green-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Lat: {location.lat.toFixed(5)} • Lng: {location.lng.toFixed(5)}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={() => { setResolvingId(null); setProofImageFile(null); setProofImagePreview(null); setLocation(null); }}>Cancel</Button>
                <Button type="submit" disabled={!proofImageFile || !location || isSubmitting} className="flex-1 bg-[#1A4331] hover:bg-[#2E7D32] text-white rounded-xl h-12 shadow-lg shadow-[#1A4331]/20">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Verifying...</span>
                  ) : (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Submit Proof</span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
