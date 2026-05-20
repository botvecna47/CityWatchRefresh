import { useMemo, ElementType, useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { format, subDays, differenceInHours } from "date-fns";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import { AlertCircle, CheckCircle2, ShieldAlert, Users, Target, TrendingUp, Map as MapIcon, Activity } from "lucide-react";
import { Card, Badge, cn } from "../../components/ui";
import { Report, User } from "../../types";
import { adminService } from "../../api/services";

export function StatCard({ title, value, icon: Icon, color, bg, borderColor }: { title: string, value: number, icon: ElementType, color: string, bg: string, borderColor: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={cn("p-6 bg-white shadow-sm border overflow-hidden relative group rounded-2xl", borderColor)}>
        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity", bg)}></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className={cn("p-3 rounded-xl", bg, color)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium font-serif leading-tight uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black text-[#1A4331] font-sans tracking-tight">{value}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function AdminOverview({ reports: paginatedReports, users }: { reports: Report[], users: User[] }) {
  const [globalReports, setGlobalReports] = useState<Report[]>([]);

  useEffect(() => {
    // Fetch global reports for accurate total stats and map rendering
    adminService.getComplaints(0, 1000).then((res: any) => {
      const data = res.content || [];
      setGlobalReports(data.map((r: any) => ({
        id: r.id, category: r.category, title: r.title, description: r.description,
        imageUrls: r.imageUrls || [],
        location: { address: r.locationText, lat: r.latitude || 0, lng: r.longitude || 0 },
        lat: r.latitude || 0, lng: r.longitude || 0,
        status: (r.status || "Reported").split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') as any,
        urgency: r.priority === "HIGH" ? "High" : r.priority === "MEDIUM" ? "Medium" : "Low",
        createdAt: r.createdAt, area: r.areaName || "Unknown", authorId: r.citizenId, authorName: r.citizenName,
        coordinatorId: r.coordinatorId, upvotes: r.upvotes || 0, comments: 0
      })));
    }).catch(console.error);
  }, []);

  const reportsToUse = globalReports.length > 0 ? globalReports : paginatedReports;

  const total = reportsToUse.length;
  const completed = reportsToUse.filter(r => r.status === "Completed" || r.status === "Closed").length;
  const inProgress = reportsToUse.filter(r => r.status === "In Progress" || r.status === "Assigned").length;
  const pending = total - completed;

  const activeReports = reportsToUse.filter(r => r.status !== "Completed" && r.status !== "Closed");

  const timeData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, 'MMM dd');
      
      const dayStart = new Date(d).setHours(0,0,0,0);
      const dayEnd = new Date(d).setHours(23,59,59,999);
      
      const received = reportsToUse.filter(r => {
        if (!r.createdAt) return false;
        const rTime = new Date(r.createdAt).getTime();
        if (isNaN(rTime)) return false;
        return rTime >= dayStart && rTime <= dayEnd;
      }).length;
      
      const resolved = reportsToUse.filter(r => {
        if (!r.createdAt) return false;
        const rTime = new Date(r.createdAt).getTime();
        if (isNaN(rTime)) return false;
        return (r.status === "Completed" || r.status === "Closed") && rTime >= dayStart && rTime <= dayEnd;
      }).length;
      
      data.push({
        date: dateStr,
        Received: received,
        Resolved: resolved,
      });
    }
    return data;
  }, [reportsToUse]);

  const areaData = useMemo(() => {
    const areaMap = new Map<string, { breached: number, atRisk: number, onTrack: number }>();
    
    reportsToUse.forEach(r => {
      const area = r.area || "Unknown";
      if (!areaMap.has(area)) {
        areaMap.set(area, { breached: 0, atRisk: 0, onTrack: 0 });
      }
      const stats = areaMap.get(area)!;
      
      if (r.status === "Completed" || r.status === "Closed") {
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
  }, [reportsToUse]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Issues" value={pending} icon={Activity} color="text-amber-600" bg="bg-amber-100/50" borderColor="border-amber-100" />
        <StatCard title="Resolved" value={completed} icon={CheckCircle2} color="text-green-600" bg="bg-green-100/50" borderColor="border-green-100" />
        <StatCard title="In Progress" value={inProgress} icon={Activity} color="text-blue-600" bg="bg-blue-100/50" borderColor="border-blue-100" />
        <StatCard title="Field Staff" value={users.filter(u => u.role === 'coordinator').length} icon={Users} color="text-[#1A4331]" bg="bg-[#1A4331]/10" borderColor="border-[#1A4331]/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-3xl col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#1A4331] font-serif flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#2E7D32]" /> Global Live Map
            </h3>
            <div className="flex gap-3 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 text-xs font-semibold text-gray-600">
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div> Critical</span>
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Normal</span>
               <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div> Low</span>
            </div>
          </div>
          <div className="w-full h-80 bg-gray-100 rounded-2xl relative overflow-hidden shadow-inner border border-gray-200 z-0">
            <MapContainer center={[19.1383, 77.3210]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              {activeReports.map(report => (
                <CircleMarker 
                  key={report.id} 
                  center={[report.lat, report.lng]}
                  radius={report.urgency === 'High' ? 12 : report.urgency === 'Medium' ? 8 : 6}
                  fillColor={report.urgency === 'High' ? '#ef4444' : report.urgency === 'Medium' ? '#f59e0b' : '#3b82f6'}
                  color="white"
                  weight={2}
                  fillOpacity={0.85}
                >
                  <Popup>
                    <div className="text-sm font-serif min-w-[200px]">
                      <p className="font-bold text-[#1A4331] mb-1 text-base">{report.title}</p>
                      <p className="text-xs text-gray-500 mb-2">{report.area}</p>
                      <Badge variant="outline" className={cn("text-[10px] py-0 border", report.urgency === 'High' ? "border-red-200 text-red-600 bg-red-50" : "border-amber-200 text-amber-600 bg-amber-50")}>{report.urgency}</Badge>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-3xl">
          <h3 className="text-xl font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2E7D32]" /> 30-Day Trend
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="Received" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Resolved" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-3xl col-span-1 lg:col-span-2">
          <h3 className="text-xl font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" /> SLA Health by Zone
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }} width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="On Track" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="At Risk" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="SLA Breached" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-3xl">
          <h3 className="text-xl font-bold text-[#1A4331] mb-6 font-serif flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Top Coordinators
          </h3>
          <div className="space-y-4">
            {users.filter(u => u.role === 'coordinator').map((u, index) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1A4331]/10 text-[#1A4331] flex items-center justify-center text-xs font-bold border border-[#1A4331]/20">
                    #{index + 1}
                  </div>
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-gray-200 bg-white" />
                  <div>
                    <p className="font-bold text-sm text-[#1A4331] leading-none mb-1">{u.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{u.area}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Avg Time</p>
                  <p className="text-sm font-black text-green-600">{12 + index * 4}h</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
