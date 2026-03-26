import { useState, useMemo, useEffect } from "react";
import { Users, AlertCircle, CheckCircle2, ShieldBan, ShieldAlert, Check, X, Ban, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { useAppContext, User, Report } from "../store";
import { api } from "../api";
import { Card, Button, Input, Badge, cn } from "../components/ui";
import { motion, AnimatePresence } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function AdminPanel() {
  const { users, currentUser, reports, loadAdminUsers, banUser, unbanUser } = useAppContext();
  const [localReports, setLocalReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "coordinators" | "applications" | "users" | "spam">("overview");

  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadAdminUsers();
      api.admin.complaints().then(data => setLocalReports(data.map((c: any) => ({
        id: String(c.id), category: c.category, title: c.category + " Issue",
        description: c.description, status: c.status, lat: c.latitude ?? 0, lng: c.longitude ?? 0,
        authorId: String(c.citizenId), authorName: c.citizenName, area: c.areaName,
        upvotes: 0, downvotes: 0, comments: [], createdAt: c.createdAt, urgency: c.priority,
      })))).catch(() => {});
    }
  }, [currentUser]);

  if (currentUser?.role !== "admin") {
    return <div className="p-8 text-center text-red-500 font-bold font-serif bg-red-50 border border-red-200 rounded-sm">Access Denied. Administrator privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Control Panel</h1>
          <p className="text-gray-600 font-serif">System overview and user management.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        {(["overview", "applications", "coordinators", "users", "spam"] as const).map(tab => {
          let badgeCount = 0;
          if (tab === "applications" || tab === "spam") badgeCount = 0;

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
              {tab}
              {badgeCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">{badgeCount}</span>
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
            {activeTab === "overview" && <AdminOverview reports={localReports} users={users} />}
            {activeTab === "applications" && <div className="p-8 text-center text-gray-500">Application management coming soon.</div>}
            {activeTab === "coordinators" && <UserManagement users={users.filter(u => u.role === "coordinator")} title="Coordinator Management" />}
            {activeTab === "users" && <UserManagement users={users.filter(u => u.role === "citizen")} title="Citizen Management" />}
            {activeTab === "spam" && <div className="p-8 text-center text-gray-500">Spam management coming soon.</div>}
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

  const areaData = useMemo(() => {
    const areas = ["North Area", "South Area", "East Area", "West Area"];
    return areas.map((area, index) => ({
      id: `area-${index}`,
      name: area.split(' ')[0],
      Active: reports.filter(r => r.area === area && r.status !== "Completed").length,
      Resolved: reports.filter(r => r.area === area && r.status === "Completed").length,
    }));
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Reports" value={total} icon={AlertCircle} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Resolved Issues" value={completed} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Pending Review" value={pending} icon={ShieldAlert} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Critical Urgency" value={highUrgency} icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A4331] mb-6 font-serif border-b border-gray-100 pb-2">Issue Distribution by Area</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} />
                <XAxis key="xaxis" dataKey="name" axisLine={false} tickLine={false} />
                <YAxis key="yaxis" axisLine={false} tickLine={false} />
                <Tooltip key="tooltip" cursor={{ fill: 'transparent' }} />
                <Bar key="bar-active" dataKey="Active" stackId="a" fill="#f59e0b" isAnimationActive={false} />
                <Bar key="bar-resolved" dataKey="Resolved" stackId="a" fill="#22c55e" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-[#1A4331] mb-4 font-serif border-b border-gray-100 pb-2">Recent System Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {reports.slice(0, 10).map(r => (
              <div key={r.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-sm transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", r.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500')}></div>
                  <span className="font-medium text-[#1A4331] font-serif text-sm truncate max-w-[200px] sm:max-w-xs">{r.title}</span>
                </div>
                <span className="text-xs text-gray-500 font-serif whitespace-nowrap">{r.area}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: { title: string, value: number, icon: any, color: string, bg: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="p-6 bg-white border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={cn("p-3 rounded-sm", bg, color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium font-serif">{title}</p>
          <p className="text-2xl font-bold text-[#1A4331] font-serif">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}

export function UserManagement({ users, title }: { users: User[], title: string }) {
  const { banUser, unbanUser } = useAppContext();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u: User) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">{title}</h2>
        <div className="w-full sm:w-64">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm font-serif min-w-[600px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-200 text-gray-600">
            <tr>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role/Area</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <p className="font-medium text-[#1A4331]">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {u.role === "coordinator" ? (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{u.area || "Unassigned"}</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Citizen</Badge>
                  )}
                </td>
                <td className="p-4">
                  {u.status === "active" ? (
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium bg-red-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> Banned
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {u.status === "active" ? (
                    <Button variant="secondary" size="sm" onClick={() => banUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50 h-8">
                      <Ban className="w-4 h-4 mr-1" /> Ban
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => unbanUser(u.id)} className="text-green-600 border-green-200 hover:bg-green-50 h-8">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Unban
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
