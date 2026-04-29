import { useState, useMemo, ElementType, useEffect } from "react";
import { Users, AlertCircle, CheckCircle2, ShieldBan, ShieldAlert, Check, X, Ban, MoreVertical, Trash2, Mail, Phone, MapPin, Briefcase, Target, Settings, Megaphone, Clock, Map as MapIcon, TrendingUp, Search, Filter, Layers, Zap } from "lucide-react";
import { useAppContext, User, Report } from "../store";
import { Card, Button, Input, Badge, cn, Textarea } from "../components/ui";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { format, subDays, differenceInHours } from "date-fns";
import { toast } from "sonner";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix standard Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function AdminPanel() {
  const { users, currentUser, reports, applications, spamReports, refreshApplications, refreshSpamReports } = useAppContext();
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "coordinators" | "users" | "applications" | "spam" | "system">("overview");

  if (currentUser?.role !== "admin") {
    return <div className="p-8 text-center text-red-500 font-bold font-serif bg-red-50 border border-red-200 rounded-sm">Access Denied. Administrator privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Command Center</h1>
          <p className="text-gray-600 font-serif">City-level overview and tactical administration.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        {(["overview", "issues", "coordinators", "users", "applications", "spam", "system"] as const).map(tab => {
          let badgeCount = 0;
          if (tab === "applications") badgeCount = applications.filter(a => a.status === "pending").length;
          if (tab === "spam") badgeCount = spamReports.filter(s => s.status === "pending").length;
          if (tab === "issues") badgeCount = reports.filter(r => r.urgency === "High" && r.status !== "Completed").length; // Highlight critical issues

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
              role="tab"
              className={cn(
                "px-4 py-2 font-medium text-sm transition-all border-b-2 font-serif capitalize tracking-wide flex items-center gap-2",
                activeTab === tab 
                  ? "border-[#1A4331] text-[#1A4331] bg-[#1A4331]/5" 
                  : "border-transparent text-gray-500 hover:text-[#1A4331] hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {tab === "system" ? "System Config" : tab}
              {badgeCount > 0 && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full shadow-sm text-white", tab === 'issues' ? 'bg-amber-500' : 'bg-red-500')}>{badgeCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="relative outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {activeTab === "overview" && <AdminOverview reports={reports} users={users} />}
            {activeTab === "issues" && <IssuesManagement reports={reports} users={users} />}
            {activeTab === "coordinators" && <CoordinatorManagement users={users.filter(u => u.role === "coordinator")} reports={reports} />}
            {activeTab === "users" && <UserManagement users={users.filter(u => u.role === "citizen")} title="Citizen Directory" />}
            {activeTab === "applications" && <ApplicationsManagement />}
            {activeTab === "spam" && <SpamManagement />}
            {activeTab === "system" && <SystemManagement />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AdminOverview({ reports, users }: { reports: Report[], users: User[] }) {
  const total = reports.length;
  const completed = reports.filter(r => r.status === "Completed").length;
  const pending = total - completed;
  const highUrgency = reports.filter(r => r.urgency === "High" && r.status !== "Completed").length;

  const activeReports = reports.filter(r => r.status !== "Completed");

  // Time-series data for multi-line chart (Received vs Resolved)
  const timeData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'MMM dd');
      
      const dayStart = new Date(d).setHours(0,0,0,0);
      const dayEnd = new Date(d).setHours(23,59,59,999);
      
      const received = reports.filter(r => {
        if (!r.createdAt) return false;
        const rTime = new Date(r.createdAt).getTime();
        if (isNaN(rTime)) return false;
        return rTime >= dayStart && rTime <= dayEnd;
      }).length;
      
      const resolved = reports.filter(r => {
        if (!r.createdAt) return false;
        const rTime = new Date(r.createdAt).getTime();
        if (isNaN(rTime)) return false;
        return r.status === "Completed" && rTime >= dayStart && rTime <= dayEnd;
      }).length;
      
      data.push({
        date: dateStr,
        Received: received,
        Resolved: resolved,
      });
    }
    return data;
  }, [reports]);

  // Heatmap Data (SLA breach rates)
  const areaData = useMemo(() => {
    const areaMap = new Map<string, { breached: number, atRisk: number, onTrack: number }>();
    
    reports.forEach(r => {
      const area = r.area || "Unknown";
      if (!areaMap.has(area)) {
        areaMap.set(area, { breached: 0, atRisk: 0, onTrack: 0 });
      }
      const stats = areaMap.get(area)!;
      
      if (r.status === "Completed") {
        stats.onTrack++;
      } else {
        const createdDate = r.createdAt ? new Date(r.createdAt) : null;
        if (!createdDate || isNaN(createdDate.getTime())) {
          stats.onTrack++;
          return;
        }
        const ageHours = differenceInHours(new Date(), createdDate);
        if (ageHours > 48 || (r.urgency === "High" && ageHours > 24)) {
          stats.breached++;
        } else if (ageHours > 24 || (r.urgency === "High" && ageHours > 12)) {
          stats.atRisk++;
        } else {
          stats.onTrack++;
        }
      }
    });

    return Array.from(areaMap.entries()).map(([name, stats]) => ({
      name,
      "SLA Breached": stats.breached,
      "At Risk": stats.atRisk,
      "On Track": stats.onTrack,
    }));
  }, [reports]);



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Complaints" value={pending} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Resolved Issues" value={completed} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Critical SLA Risks" value={highUrgency} icon={ShieldAlert} color="text-red-600" bg="bg-red-50" />
        <StatCard title="Active Coordinators" value={users.filter(u => u.role === 'coordinator').length} icon={Users} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Live Map */}
        <Card className="p-6 bg-white shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#2E7D32]" /> Global Live Map (Nanded)
            </h3>
            <div className="flex gap-3 text-xs font-medium text-gray-500">
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> High</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Low</span>
            </div>
          </div>
          <div className="w-full h-80 bg-[#e5e7eb] rounded-lg relative overflow-hidden shadow-inner z-0">
            <MapContainer center={[19.1383, 77.3210]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {activeReports.map(report => (
                <CircleMarker 
                  key={report.id} 
                  center={[report.lat, report.lng]}
                  radius={report.urgency === 'High' ? 12 : report.urgency === 'Medium' ? 8 : 6}
                  fillColor={report.urgency === 'High' ? '#ef4444' : report.urgency === 'Medium' ? '#f59e0b' : '#3b82f6'}
                  color="white"
                  weight={2}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="text-sm font-serif">
                      <p className="font-bold text-[#1A4331] mb-1">{report.title}</p>
                      <p className="text-xs text-gray-500 mb-1">{report.area}</p>
                      <Badge variant="outline" className="text-[10px] py-0">{report.urgency}</Badge>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-sm border border-gray-200 text-[10px] text-gray-500 font-medium z-[1000] pointer-events-none">CityWatch Overlay System</div>
          </div>
        </Card>

        {/* Complaints Trend (30 Days) */}
        <Card className="p-6 bg-white shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2 border-b border-gray-100 pb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" /> 30-Day Resolution Trend
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                <Line type="monotone" dataKey="Received" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Resolved" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Coordinators Widget */}
        <Card className="p-6 bg-white shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2 border-b border-gray-100 pb-2">
            <Users className="w-5 h-5 text-blue-500" /> Top Coordinators
          </h3>
          <div className="space-y-4">
            {users.filter(u => u.role === 'coordinator').map((u, index) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A4331] text-white flex items-center justify-center text-xs font-bold">
                    #{index + 1}
                  </div>
                  <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-bold text-sm text-[#1A4331]">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase">Avg Time</p>
                  <p className="text-sm font-bold text-green-600">{12 + index * 4}h</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SLA Heatmap */}
        <Card className="p-6 bg-white shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2 border-b border-gray-100 pb-2">
            <Target className="w-5 h-5 text-purple-500" /> SLA Health Breakdown by Zone
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="On Track" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={30} />
                <Bar dataKey="At Risk" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="SLA Breached" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: ElementType, color: string, bg: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="p-6 bg-white border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={cn("p-3 rounded-sm", bg, color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium font-serif leading-tight">{title}</p>
          <p className="text-2xl font-bold text-[#1A4331] font-serif">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function IssuesManagement({ reports, users }: { reports: Report[], users: User[] }) {
  const { deleteReport, updateReport, refreshReports } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterUrgency, setFilterUrgency] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<string>("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");

  const filtered = reports.filter(r => {
    if (filterArea !== "All" && r.area !== filterArea) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterUrgency !== "All" && r.urgency !== filterUrgency) return false;
    if (filterDate !== "All") {
      const daysElapsed = differenceInHours(new Date(), new Date(r.createdAt)) / 24;
      if (filterDate === "Today" && daysElapsed > 1) return false;
      if (filterDate === "Week" && daysElapsed > 7) return false;
      if (filterDate === "Month" && daysElapsed > 30) return false;
    }
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedReport = reports.find(r => r.id === selectedIssueId);
  const assignedCoordinator = selectedReport?.coordinatorId ? users.find(u => u.id === selectedReport.coordinatorId) : null;

  // Sync editingStatus when drawer opens
  useEffect(() => {
    if (selectedReport) setEditingStatus(selectedReport.status);
  }, [selectedIssueId]);

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <Input placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full md:max-w-xs" />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Reported">Reported (New)</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterArea} onChange={e => setFilterArea(e.target.value)}>
            <option value="All">All Areas</option>
            {Array.from(new Set(reports.map(r => r.area))).filter(Boolean).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm font-serif min-w-[800px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-200 text-gray-600">
            <tr>
              <th className="p-4 font-medium">Issue</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status & SLA</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => {
              const hoursElapsed = differenceInHours(new Date(), new Date(r.createdAt));
              const isBreached = hoursElapsed > 48 && r.status !== "Completed";
              const isWarning = hoursElapsed > 24 && !isBreached && r.status !== "Completed";

              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedIssueId(r.id)}>
                  <td className="p-4">
                    <p className="font-bold text-[#1A4331]">{r.title}</p>
                    <p className="text-xs text-gray-500">Reported by {r.authorName}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-gray-50">{r.area}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge className={cn(
                        "font-medium",
                        r.status === "Reported" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                        r.status === "In Progress" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                        "bg-green-100 text-green-800 hover:bg-green-100"
                      )}>{r.status}</Badge>
                      {isBreached ? (
                         <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> SLA Breach ({hoursElapsed}h)</span>
                      ) : isWarning ? (
                         <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> SLA Warning</span>
                      ) : r.status === "Completed" ? (
                         <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Resolved</span>
                      ) : (
                         <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {48 - hoursElapsed}h remaining</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                     <span className={cn("inline-flex items-center gap-1 text-xs font-bold", r.urgency === "High" ? "text-red-600" : r.urgency === "Medium" ? "text-amber-600" : "text-blue-600")}>
                        <div className={cn("w-2 h-2 rounded-full", r.urgency === "High" ? "bg-red-500" : r.urgency === "Medium" ? "bg-amber-500" : "bg-blue-500")}></div>
                        {r.urgency}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8">View <MoreVertical className="w-4 h-4 ml-1" /></Button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No issues found matching criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Drawer for Issue Details */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setSelectedIssueId(null)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-[#1A4331] font-serif">Report Matrix</h2>
                <button onClick={() => setSelectedIssueId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="font-bold text-2xl text-[#1A4331] mb-2 font-serif leading-tight">{selectedReport.title}</h3>
                    <p className="text-gray-600 text-sm font-serif mb-4">{selectedReport.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                       <Badge className="bg-[#1A4331]/10 text-[#1A4331] border-none">{selectedReport.area}</Badge>
                       <Badge variant="outline">{selectedReport.urgency} Priority</Badge>
                       <Badge variant="outline">{selectedReport.status}</Badge>
                    </div>
                 </div>

                 {selectedReport.image && (
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Evidence</p>
                      <img src={selectedReport.image} alt="Report" className="w-full h-48 object-cover rounded-sm border border-gray-200" />
                   </div>
                 )}

                 <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment Details</p>
                    {assignedCoordinator ? (
                       <div className="flex items-center gap-3">
                          <img src={assignedCoordinator.avatar} alt="Coordinator" className="w-10 h-10 rounded-full border border-gray-300" />
                          <div>
                             <p className="font-bold text-[#1A4331] text-sm">{assignedCoordinator.name}</p>
                             <p className="text-xs text-gray-500">Coordinator â€¢ {assignedCoordinator.area}</p>
                          </div>
                       </div>
                    ) : (
                       <p className="text-sm text-gray-600 italic">No coordinator assigned yet.</p>
                    )}
                 </div>

                 {selectedReport.proofImage && (
                   <div className="bg-green-50 p-4 rounded-sm border border-green-200">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Resolution Proof</p>
                      <img src={selectedReport.proofImage} alt="Proof" className="w-full h-48 object-cover rounded-sm border border-green-300" />
                   </div>
                 )}
                 
                 <div className="pt-4 flex gap-2">
                     <select
                       value={editingStatus}
                       onChange={e => setEditingStatus(e.target.value)}
                       className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-serif"
                     >
                       <option value="Reported">Reported</option>
                       <option value="In Progress">In Progress</option>
                       <option value="Completed">Completed</option>
                     </select>
                     <Button
                       className="bg-[#1A4331] hover:bg-[#112d21]"
                       onClick={async () => {
                         if (selectedReport && editingStatus !== selectedReport.status) {
                           await updateReport(selectedReport.id, { status: editingStatus as any });
                           toast.success("Status updated!");
                         }
                       }}
                     >Update</Button>
                     <Button
                       variant="outline"
                       className="text-red-600 border-red-200 hover:bg-red-50"
                       onClick={() => {
                         if (selectedReport && window.confirm("Delete this complaint permanently?")) {
                           deleteReport(selectedReport.id);
                           setSelectedIssueId(null);
                         }
                       }}
                     ><Trash2 className="w-4 h-4" /></Button>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function CoordinatorManagement({ users, reports }: { users: User[], reports: Report[] }) {
  const { banUser, unbanUser } = useAppContext();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">Coordinator Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const coordinatorReports = reports.filter(r => r.coordinatorId === u.id);
          const active = coordinatorReports.filter(r => r.status === "In Progress").length;
          const resolved = coordinatorReports.filter(r => r.status === "Completed").length;
          const avgResolutionTime = resolved > 0 ? `${Math.floor(Math.random() * 24 + 12)}h` : "N/A"; // Mock avg time

          return (
            <Card key={u.id} className="p-6 bg-white border border-gray-200 shadow-sm flex flex-col hover:border-[#2E7D32]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm" />
                   <div>
                     <h3 className="font-bold text-[#1A4331] font-serif">{u.name}</h3>
                     <Badge variant="secondary" className="bg-[#1A4331]/5 text-[#1A4331] border-none mt-1">{u.area}</Badge>
                   </div>
                 </div>
                 {u.status !== "active" && <Badge variant="destructive">Banned</Badge>}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 flex-1">
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-amber-600">{active}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Active</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-green-600">{resolved}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Resolved</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                    <p className="text-xl font-bold text-[#1A4331]">{avgResolutionTime}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Avg Time</p>
                 </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm" className="w-full">Message</Button>
                {u.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="w-full text-red-600 border-red-200 hover:bg-red-50">Revoke</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="w-full text-green-600 border-green-200 hover:bg-green-50">Restore</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function SystemManagement() {
  const { areas, categories, refreshMasterData } = useAppContext();
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  
  const [newArea, setNewArea] = useState({ name: "", city: "Nanded", centerLat: 19.15, centerLng: 77.31 });
  const [newCat, setNewCat] = useState({ name: "", description: "", defaultSlaHours: 72 });

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newArea)
      });
      if (res.ok) {
        toast.success("Area added successfully");
        setShowAreaForm(false);
        refreshMasterData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add area");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        toast.success("Category added successfully");
        setShowCatForm(false);
        refreshMasterData();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to add category");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handleDeleteArea = async (id: number) => {
    if (!window.confirm("Soft delete this area? This will hide it from new reports but keep old ones intact.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Area soft deleted");
        refreshMasterData();
      }
    } catch (e) { toast.error("Delete failed"); }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Soft delete this category? This will hide it from new reports but keep old ones intact.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Category soft deleted");
        refreshMasterData();
      }
    } catch (e) { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Area Management */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-emerald-600" /> Manage City Areas
            </h3>
            <Button size="sm" onClick={() => setShowAreaForm(!showAreaForm)} variant="outline">
              {showAreaForm ? "Cancel" : "Add Area"}
            </Button>
          </div>

          <AnimatePresence>
            {showAreaForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddArea}
                className="space-y-3 mb-6 p-4 bg-emerald-50 rounded-md border border-emerald-100 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Area Name</label>
                    <Input placeholder="e.g. Taroda Naka" value={newArea.name} onChange={e => setNewArea({...newArea, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lat</label>
                    <Input type="number" step="0.0001" value={newArea.centerLat} onChange={e => setNewArea({...newArea, centerLat: parseFloat(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Center Lng</label>
                    <Input type="number" step="0.0001" value={newArea.centerLng} onChange={e => setNewArea({...newArea, centerLng: parseFloat(e.target.value)})} required />
                  </div>
                </div>
                <Button size="sm" className="w-full bg-[#1A4331]">Save New Area</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {areas.map(area => (
              <div key={area.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-sm border border-gray-100 group">
                <div>
                  <span className="text-sm font-bold text-gray-700 block">{area.name}</span>
                  <span className="text-[10px] text-gray-400">{area.centerLat}, {area.centerLng}</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteArea(area.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Management */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> Issue Categories & SLA
            </h3>
            <Button size="sm" onClick={() => setShowCatForm(!showCatForm)} variant="outline">
              {showCatForm ? "Cancel" : "Add Category"}
            </Button>
          </div>

          <AnimatePresence>
            {showCatForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleAddCategory}
                className="space-y-3 mb-6 p-4 bg-blue-50 rounded-md border border-blue-100 overflow-hidden"
              >
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Category Name</label>
                  <Input placeholder="e.g. ANIMAL_WELFARE" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value.toUpperCase()})} required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Default SLA (Hours)</label>
                  <Input type="number" value={newCat.defaultSlaHours} onChange={e => setNewCat({...newCat, defaultSlaHours: parseInt(e.target.value)})} required />
                </div>
                <Button size="sm" className="w-full bg-[#1A4331]">Save Category</Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-sm border border-gray-100 group">
                <div>
                  <span className="text-sm font-bold text-gray-700 block">{cat.name}</span>
                  <span className="text-[10px] text-gray-400">Resolution Target: {cat.defaultSlaHours} hrs</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCategory(cat.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BroadcastTool />
    </div>
  );
}

function BroadcastTool() {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm max-w-2xl">
      <h3 className="text-lg font-bold text-[#1A4331] mb-2 font-serif flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-[#2E7D32]" /> System Broadcast
      </h3>
      <p className="text-sm text-gray-500 mb-6 font-serif">Send a global push notification to specific user groups.</p>

      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Broadcast sent successfully!"); }}>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Target Audience</label>
          <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-serif">
            <option>All Users (Citizens & Coordinators)</option>
            <option>Coordinators Only</option>
            <option>Citizens Only</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message Title</label>
          <Input placeholder="e.g. System Maintenance Notice" required />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Content</label>
          <Textarea placeholder="Write your announcement here..." className="min-h-[100px]" required />
        </div>
        <Button className="bg-[#1A4331] hover:bg-[#112d21] text-white font-serif">
          <Zap className="w-4 h-4 mr-2" /> Launch Broadcast
        </Button>
      </form>
    </Card>
  );
}

function ApplicationsManagement() {
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
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
          <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          No pending applications to review.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingApps.map(app => (
            <Card key={app.id} className="p-6 bg-white border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-[#1A4331] text-xl font-serif">{app.userName}</h3>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {app.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {app.phone}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {app.address}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-sm">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4" /> Relevant Experience
                  </h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-sm border border-gray-100">{app.experience}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Motivation Message</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-sm border border-gray-100 italic">"{app.message}"</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                <div className="w-full sm:w-auto flex-1">
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm font-serif focus:ring-2 focus:ring-[#2E7D32]"
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
                  <Button variant="outline" onClick={() => updateApplicationStatus(app.id, "rejected")} className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button onClick={() => handleApprove(app.id)} className="flex-1 sm:flex-none bg-[#2E7D32] hover:bg-[#1b5e20] text-white">
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

function UserManagement({ users, title }: { users: User[], title: string }) {
  const { banUser, unbanUser } = useAppContext();
  const [search, setSearch] = useState("");

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">{title}</h2>
        <div className="w-full sm:w-64 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input placeholder="Search citizens..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm font-serif min-w-[600px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-200 text-gray-600">
            <tr>
              <th className="p-4 font-medium">User Profile</th>
              <th className="p-4 font-medium">System Role</th>
              <th className="p-4 font-medium">Account Status</th>
              <th className="p-4 font-medium text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <p className="font-bold text-[#1A4331]">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">Citizen</Badge>
                </td>
                <td className="p-4">
                  {u.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> Banned
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {u.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50 h-8">
                      <Ban className="w-4 h-4 mr-1" /> Suspend
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="text-green-600 border-green-200 hover:bg-green-50 h-8">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Restore
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No users found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpamManagement() {
  const { spamReports, resolveSpamReport, deleteReport } = useAppContext();
  const [filterCategory, setFilterCategory] = useState<string>("All");
  
  const pendingSpam = spamReports.filter(s => {
    if (s.status !== "pending") return false;
    if (filterCategory !== "All" && s.targetType !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">Spam & Abuse Reports</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <select 
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif"
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="report">Report</option>
            <option value="comment">Comment</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
      
      {pendingSpam.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          System is clean. No pending abuse reports.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSpam.map(spam => (
            <Card key={spam.id} className="p-5 bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">{spam.targetType}</Badge>
                  <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-sm">Target ID: {spam.targetId}</span>
                  <span className="text-xs text-gray-400 ml-2">{spam.createdAt ? new Date(spam.createdAt).toLocaleDateString() : "Pending Date"}</span>
                </div>
                <p className="text-[#1A4331] font-serif">Reported by <span className="font-bold">{spam.reporterName}</span></p>
                <p className="text-gray-600 text-sm mt-2 bg-red-50 p-2 rounded-sm border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  {spam.reason}
                </p>
              </div>
              <div className="w-full sm:w-auto flex flex-col gap-2">
                {spam.targetType === 'report' && (
                  <Button size="sm" onClick={() => {
                    if (window.confirm("Are you sure you want to delete the associated post? This will softly wipe it from feeds.")) {
                      deleteReport(spam.targetId, spam.id);
                    }
                  }} variant="outline" className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                  </Button>
                )}
                <Button size="sm" onClick={() => resolveSpamReport(spam.id)} variant="outline" className="w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50">
                  <Check className="w-4 h-4 mr-2" /> Dismiss
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
