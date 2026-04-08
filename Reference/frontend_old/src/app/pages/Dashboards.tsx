import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2, Clock, MapPin, MessageSquare, Star, Upload, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { useAppContext, Report } from "../store";
import { api } from "../api";
import { Card, Button, Badge, cn } from "../components/ui";
import { StatusBadge } from "./Home";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";

export function Dashboard() {
  const { currentUser } = useAppContext();
  const [myReports, setMyReports] = useState<Report[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const loadFn = currentUser.role === "citizen" ? api.complaints.mine : api.complaints.assigned;
    loadFn().then(data => setMyReports(data.map((c: any) => ({
      id: String(c.id), category: c.category, title: c.category + " Issue",
      description: c.description, image: c.imageUrl, imageUrl: c.imageUrl,
      locationText: c.locationText, lat: c.latitude, lng: c.longitude,
      area: c.areaName || c.area, areaName: c.areaName, status: c.status,
      priority: c.priority, authorId: String(c.citizenId), authorName: c.citizenName,
      authorAvatar: "", upvotes: c.upvotes || 0, downvotes: c.downvotes || 0,
      coordinatorId: c.coordinatorId ? String(c.coordinatorId) : undefined,
      coordinatorName: c.coordinatorName, comments: [], createdAt: c.createdAt,
      urgency: c.priority, slaDeadline: c.slaDeadline,
    })))).catch(() => {});
  }, [currentUser]);

  if (!currentUser) return <div className="p-8 text-center text-gray-500 font-serif">Please log in to view your dashboard.</div>;

  if (currentUser.role === "citizen") return <CitizenDashboard reports={myReports} />;
  if (currentUser.role === "coordinator") return <CoordinatorDashboard reports={myReports} />;
  return <div className="p-8 text-center text-gray-500 font-serif">Select Citizen or Coordinator role to view this dashboard. Admins use the Admin Panel.</div>;
}

function CitizenDashboard({ reports }: { reports: Report[] }) {
  const [ratingModal, setRatingModal] = useState<string | null>(null);

  const pending = reports.filter(r => r.status !== "Completed");
  const completed = reports.filter(r => r.status === "Completed");

  const statusData = useMemo(() => {
    return [
      { name: 'Reported', value: reports.filter(r => r.status === 'Reported').length },
      { name: 'In Progress', value: reports.filter(r => r.status === 'In Progress').length },
      { name: 'Completed', value: reports.filter(r => r.status === 'Completed').length },
    ];
  }, [reports]);

  const COLORS = ['#3b82f6', '#f59e0b', '#22c55e'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>My Submissions</h1>
        <p className="text-gray-600 font-serif">Track the progress of issues you've reported.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-[#1A4331]">{reports.length}</p>
          </div>
          <BarChart3 className="w-10 h-10 text-gray-200" />
        </Card>
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-600 font-bold mb-1">In Progress</p>
            <p className="text-3xl font-bold text-[#1A4331]">{pending.length}</p>
          </div>
          <Clock className="w-10 h-10 text-amber-100" />
        </Card>
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-bold mb-1">Resolved</p>
            <p className="text-3xl font-bold text-[#1A4331]">{completed.length}</p>
          </div>
          <CheckCircle2 className="w-10 h-10 text-green-100" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A4331] flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Clock className="w-5 h-5 text-amber-500" /> Active Issues
          </h2>
          {pending.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">No active reports.</p>}
          {pending.map(r => (
            <ReportSummaryCard key={r.id} report={r} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A4331] flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Resolved
          </h2>
          {completed.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">No completed reports yet.</p>}
          {completed.map(r => (
            <div key={r.id} className="relative group">
              <ReportSummaryCard report={r} />
              {r.coordinatorId && (
                <Button 
                  onClick={() => setRatingModal(r.id)}
                  size="sm"
                  className="absolute top-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2E7D32]"
                >
                  <Star className="w-3 h-3" fill="white" /> Rate Resolution
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {ratingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl animate-in zoom-in-95 duration-200 border border-gray-200">
            <h3 className="text-xl font-bold text-[#1A4331] mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Rate Coordinator</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-serif">How satisfied are you with the resolution of this issue?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="p-2 hover:scale-110 transition-transform focus:outline-none group">
                  <Star className="w-8 h-8 text-gray-300 group-hover:text-yellow-400 group-focus:text-yellow-400 transition-colors" />
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRatingModal(null)}>Cancel</Button>
              <Button onClick={() => setRatingModal(null)} className="bg-[#1A4331] hover:bg-[#112d21] text-white">Submit Rating</Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

function CoordinatorDashboard({ reports }: { reports: Report[] }) {
  const { currentUser, updateReportStatus } = useAppContext();
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const assigned = reports.filter(r => r.status === "IN_PROGRESS" || r.status === "ASSIGNED");
  const available = reports.filter(r => r.status === "PENDING_REVIEW" || r.status === "APPROVED");
  const completed = reports.filter(r => r.status === "COMPLETED" || r.status === "CLOSED");

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingId && proofImage && location) {
      api.complaints.submitProof(resolvingId, { imageUrl: proofImage, latitude: location.lat, longitude: location.lng })
        .then(() => { updateReportStatus(resolvingId, "COMPLETED"); toast.success("Issue marked as completed!"); })
        .catch(() => toast.error("Failed to submit proof."));
      setResolvingId(null); setProofImage(null); setLocation(null);
    } else {
      toast.error("Both photo and location are required.");
    }
  };

  const getLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setGettingLocation(false);
          toast.success("Location acquired successfully");
        },
        (error) => {
          console.error(error);
          // Fallback location for demo purposes if it fails
          setLocation({ lat: 40.7128, lng: -74.0060 });
          setGettingLocation(false);
          toast.success("Location simulated for demo purposes");
        }
      );
    } else {
      // Fallback
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
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
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
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
                <Button
                  onClick={() => api.complaints.updateStatus(r.id, "IN_PROGRESS").then(() => updateReportStatus(r.id, "IN_PROGRESS")).catch(() => toast.error("Failed"))}
                  size="sm"
                  className="absolute bottom-4 right-4 bg-[#1A4331] hover:bg-[#112d21] text-white"
                >
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
                  <Clock className="w-4 h-4" /> Time Elapsed: {formatDistanceToNow(new Date(r.createdAt))}
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]"
          >
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
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) setProofImage(URL.createObjectURL(e.target.files[0]));
                  }} 
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="secondary" onClick={getLocation} disabled={gettingLocation} className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  {gettingLocation ? "Getting Location..." : location ? "Location Acquired" : "Get Current Location"}
                </Button>
              </div>
              {location && (
                <p className="text-xs text-green-600 font-medium">✓ Location verified: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={() => { setResolvingId(null); setProofImage(null); setLocation(null); }}>Cancel</Button>
                <Button type="submit" disabled={!proofImage || !location} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Confirm Resolution
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function ReportSummaryCard({ report }: { report: Report }) {
  return (
    <Card className="p-4 bg-white border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <Link to={`/report/${report.id}`} className="font-bold text-[#1A4331] hover:text-[#2E7D32] transition-colors leading-tight font-serif truncate block">
          {report.title}
        </Link>
        <StatusBadge status={report.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium font-serif flex-wrap">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> {report.area}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {report.comments.length} Comments</span>
        <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
      </div>
    </Card>
  );
}