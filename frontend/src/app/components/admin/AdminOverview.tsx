import { useMemo, ElementType } from "react";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { format, subDays, differenceInHours } from "date-fns";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import { AlertCircle, CheckCircle2, ShieldAlert, Users, Target, TrendingUp, Map as MapIcon } from "lucide-react";
import { Card, Badge, cn } from "../../components/ui";
import { Report, User } from "../../types";

export function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: ElementType, color: string, bg: string }) {
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

export function AdminOverview({ reports, users }: { reports: Report[], users: User[] }) {
  const total = reports.length;
  const completed = reports.filter(r => r.status === "Completed").length;
  const pending = total - completed;
  const highUrgency = reports.filter(r => r.urgency === "High" && r.status !== "Completed").length;

  const activeReports = reports.filter(r => r.status !== "Completed");

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
          </div>
        </Card>

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
