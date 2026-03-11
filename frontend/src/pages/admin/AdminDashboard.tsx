import { useState } from "react";
import { mockCoordinators, mockReports, mockUsers, type Coordinator, type CityUser } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, Users, FileText, ShieldCheck, Plus, X, TrendingUp, AlertTriangle, CheckCircle2,
  Search, Filter, MoreHorizontal, Ban, UserCheck, MapPin, Trash2, Edit3, Eye,
  ArrowUpDown, RefreshCw, UserX, ChevronDown, Star, Phone, Mail, Calendar,
} from "lucide-react";

const stats = [
  { label: "Total Reports", value: "1,247", icon: FileText, trend: "+12%", color: "bg-accent/10 text-accent" },
  { label: "Resolved", value: "892", icon: CheckCircle2, trend: "+8%", color: "bg-forest/10 text-forest" },
  { label: "Active Coordinators", value: "5", icon: Users, trend: "+2", color: "bg-primary/10 text-primary" },
  { label: "Spam Flagged", value: "23", icon: AlertTriangle, trend: "-5%", color: "bg-destructive/10 text-destructive" },
];

const areas = ["North Area", "South Area", "East Area"] as const;

type AdminTab = "overview" | "coordinators" | "reports" | "users";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [showModal, setShowModal] = useState(false);
  const [editCoord, setEditCoord] = useState<Coordinator | null>(null);
  const [newCoord, setNewCoord] = useState({ name: "", email: "", area: "", phone: "" });
  const [coordSearch, setCoordSearch] = useState("");
  const [coordAreaFilter, setCoordAreaFilter] = useState("All");
  const [coordStatusFilter, setCoordStatusFilter] = useState("All");
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("All");
  const [reportAreaFilter, setReportAreaFilter] = useState("All");
  const [reportSortBy, setReportSortBy] = useState<"newest" | "votes" | "comments">("newest");
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("All");
  const [showUserDetail, setShowUserDetail] = useState<CityUser | null>(null);
  const [showCoordDetail, setShowCoordDetail] = useState<Coordinator | null>(null);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "coordinators", label: "Coordinators", icon: <UserCheck className="h-4 w-4" /> },
    { id: "reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  ];

  const filteredCoords = mockCoordinators.filter((c) => {
    if (coordSearch && !c.name.toLowerCase().includes(coordSearch.toLowerCase()) && !c.email.toLowerCase().includes(coordSearch.toLowerCase())) return false;
    if (coordAreaFilter !== "All" && c.area !== coordAreaFilter) return false;
    if (coordStatusFilter !== "All" && c.status !== coordStatusFilter) return false;
    return true;
  });

  const filteredReports = mockReports
    .filter((r) => {
      if (reportSearch && !r.title.toLowerCase().includes(reportSearch.toLowerCase())) return false;
      if (reportStatusFilter !== "All" && r.status !== reportStatusFilter) return false;
      if (reportAreaFilter !== "All" && r.area !== reportAreaFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (reportSortBy === "votes") return b.upvotes - a.upvotes;
      if (reportSortBy === "comments") return b.comments - a.comments;
      return 0;
    });

  const filteredUsers = mockUsers.filter((u) => {
    if (userSearch && !u.name.toLowerCase().includes(userSearch.toLowerCase()) && !u.email.toLowerCase().includes(userSearch.toLowerCase())) return false;
    if (userStatusFilter !== "All" && u.status !== userStatusFilter) return false;
    return true;
  });

  const statusColor = (s: string) => {
    if (s === "Active") return "bg-accent/10 text-accent border-accent/30";
    if (s === "Suspended" || s === "Banned") return "bg-destructive/10 text-destructive border-destructive/30";
    if (s === "Warned") return "bg-amber/10 text-amber-foreground border-amber/30";
    return "bg-muted text-muted-foreground border-border/30";
  };

  const reportStatusColor = (s: string) => {
    if (s === "Reported") return "bg-amber/15 text-amber-foreground";
    if (s === "In Progress") return "bg-accent/10 text-accent";
    if (s === "Completed") return "bg-forest/10 text-forest";
    return "";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">Admin Control Panel</h1>
              <p className="text-sm text-muted-foreground">System management & monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-2xl p-1 mb-6 border border-border/40 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="card-premium p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  {s.trend && (
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${s.trend.startsWith("+") ? "text-accent" : "text-destructive"}`}>
                      <TrendingUp className="h-3 w-3" /> {s.trend}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" /> Resolution Analytics
            </h2>
            <div className="h-52 bg-muted/20 rounded-2xl flex items-center justify-center border border-border/20 p-6">
              <div className="flex items-end gap-2 md:gap-3 h-40 w-full max-w-lg">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer relative group"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.round(h * 10)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-muted-foreground px-2">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Quick Summaries */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Recent Reports</h3>
              <div className="space-y-2.5">
                {mockReports.slice(0, 4).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-1.5">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${r.status === "Completed" ? "bg-forest" : r.status === "In Progress" ? "bg-accent" : "bg-amber"}`} />
                    <p className="text-xs text-foreground font-medium truncate flex-1">{r.title}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{r.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Coordinator Performance</h3>
              <div className="space-y-2.5">
                {mockCoordinators.filter(c => c.status === "Active").map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-1.5">
                    <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.area}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <Star className="h-3 w-3 text-amber fill-amber" />
                      <span className="font-bold text-foreground">{c.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== COORDINATORS TAB ===== */}
      {activeTab === "coordinators" && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters */}
          <div className="card-premium p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text" placeholder="Search coordinators..." value={coordSearch}
                  onChange={(e) => setCoordSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", ...areas].map((a) => (
                  <button key={a} onClick={() => setCoordAreaFilter(a)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${coordAreaFilter === a ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >{a}</button>
                ))}
              </div>
              <div className="flex gap-2">
                {["All", "Active", "Suspended", "Inactive"].map((s) => (
                  <button key={s} onClick={() => setCoordStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${coordStatusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >{s}</button>
                ))}
              </div>
              <Button size="sm" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 gap-1 h-10"
                onClick={() => { setEditCoord(null); setNewCoord({ name: "", email: "", area: "", phone: "" }); setShowModal(true); }}>
                <Plus className="h-4 w-4" /> Add Coordinator
              </Button>
            </div>
          </div>

          {/* Coordinator Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoords.map((c) => (
              <div key={c.id} className="card-premium p-5 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                  <Badge className={`text-[10px] border ${statusColor(c.status)}`}>{c.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center bg-muted/30 rounded-xl py-2">
                    <p className="text-lg font-extrabold text-accent">{c.resolved}</p>
                    <p className="text-[10px] text-muted-foreground">Resolved</p>
                  </div>
                  <div className="text-center bg-muted/30 rounded-xl py-2">
                    <p className="text-lg font-extrabold text-amber">{c.pending}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center bg-muted/30 rounded-xl py-2">
                    <p className="text-lg font-extrabold text-foreground flex items-center justify-center gap-0.5">
                      <Star className="h-3.5 w-3.5 text-amber fill-amber" />{c.rating}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Rating</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-medium text-foreground">{c.area}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">Since {c.joinedDate}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs h-9 gap-1"
                    onClick={() => setShowCoordDetail(c)}>
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 gap-1"
                    onClick={() => { setEditCoord(c); setNewCoord({ name: c.name, email: c.email, area: c.area, phone: c.phone }); setShowModal(true); }}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 gap-1 text-destructive hover:text-destructive hover:bg-destructive/5">
                    {c.status === "Suspended" ? <RefreshCw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredCoords.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No coordinators found</p>
            </div>
          )}
        </div>
      )}

      {/* ===== REPORTS TAB ===== */}
      {activeTab === "reports" && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search reports..." value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["All", "Reported", "In Progress", "Completed"].map((s) => (
                  <button key={s} onClick={() => setReportStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${reportStatusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >{s}</button>
                ))}
              </div>
              <div className="flex gap-2">
                {["All", ...areas].map((a) => (
                  <button key={a} onClick={() => setReportAreaFilter(a)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${reportAreaFilter === a ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              {(["newest", "votes", "comments"] as const).map((s) => (
                <button key={s} onClick={() => setReportSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${reportSortBy === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">{filteredReports.length} reports</span>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground font-semibold border-b border-border/40 bg-muted/20">
                  <th className="text-left p-4">Report</th>
                  <th className="text-left p-4">Area</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Priority</th>
                  <th className="text-center p-4">Votes</th>
                  <th className="text-center p-4">Assigned</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="p-4 max-w-xs">
                      <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{r.category} · {r.timestamp}</p>
                    </td>
                    <td className="p-4"><Badge variant="secondary" className="text-[10px]">{r.area}</Badge></td>
                    <td className="p-4 text-center"><Badge className={`text-[10px] ${reportStatusColor(r.status)}`}>{r.status}</Badge></td>
                    <td className="p-4 text-center">
                      <Badge className={`text-[10px] ${r.priority === "Critical" ? "bg-destructive/15 text-destructive" : r.priority === "High" ? "bg-destructive/10 text-destructive" : r.priority === "Medium" ? "bg-amber/10 text-amber-foreground" : "bg-muted text-muted-foreground"}`}>
                        {r.priority || "Low"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center text-sm font-bold text-accent">{r.upvotes}</td>
                    <td className="p-4 text-center text-xs text-muted-foreground">{r.assignedTo || "—"}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-fade-in">
          <div className="card-premium p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search users by name or email..." value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Active", "Warned", "Banned"].map((s) => (
                  <button key={s} onClick={() => setUserStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${userStatusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-premium overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground font-semibold border-b border-border/40 bg-muted/20">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-center p-4">Role</th>
                  <th className="text-center p-4">Reports</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Last Active</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="p-4 text-center"><Badge variant="secondary" className="text-[10px]">{u.role}</Badge></td>
                    <td className="p-4 text-center text-sm font-bold text-foreground">{u.reportsCount}</td>
                    <td className="p-4 text-center"><Badge className={`text-[10px] border ${statusColor(u.status)}`}>{u.status}</Badge></td>
                    <td className="p-4 text-center text-xs text-muted-foreground">{u.lastActive}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                          onClick={() => setShowUserDetail(u)}>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {u.status === "Banned" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <UserCheck className="h-3.5 w-3.5 text-accent" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Ban className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ADD/EDIT COORDINATOR MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl p-6 w-[90%] max-w-lg border border-border shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">{editCoord ? "Edit Coordinator" : "Add Coordinator"}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                <input type="text" value={newCoord.name} onChange={(e) => setNewCoord({ ...newCoord, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input type="email" value={newCoord.email} onChange={(e) => setNewCoord({ ...newCoord, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="coordinator@citywatch.gov" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                <input type="tel" value={newCoord.phone} onChange={(e) => setNewCoord({ ...newCoord, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="+1 555-0100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Assigned Area</label>
                <div className="flex gap-2">
                  {areas.map((a) => (
                    <button key={a} onClick={() => setNewCoord({ ...newCoord, area: a })}
                      className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        newCoord.area === a ? "bg-accent text-accent-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50"
                      }`}>{a}</button>
                  ))}
                </div>
              </div>
              <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-2 h-11 font-semibold" onClick={() => setShowModal(false)}>
                {editCoord ? "Save Changes" : "Create Coordinator"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setShowUserDetail(null)}>
          <div className="bg-card rounded-2xl p-6 w-[90%] max-w-md border border-border shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">User Details</h3>
              <button onClick={() => setShowUserDetail(null)} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="text-center mb-5">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary mx-auto mb-3">
                {showUserDetail.name.split(" ").map(n => n[0]).join("")}
              </div>
              <p className="text-lg font-bold text-foreground">{showUserDetail.name}</p>
              <p className="text-sm text-muted-foreground">{showUserDetail.email}</p>
              <Badge className={`text-xs mt-2 border ${statusColor(showUserDetail.status)}`}>{showUserDetail.status}</Badge>
            </div>
            <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/30">
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Role</span><span className="text-xs font-semibold text-foreground">{showUserDetail.role}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Reports Filed</span><span className="text-xs font-semibold text-foreground">{showUserDetail.reportsCount}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Joined</span><span className="text-xs font-semibold text-foreground">{showUserDetail.joinedDate}</span></div>
              <div className="flex justify-between"><span className="text-xs text-muted-foreground">Last Active</span><span className="text-xs font-semibold text-foreground">{showUserDetail.lastActive}</span></div>
            </div>
            <div className="flex gap-2 mt-5">
              {showUserDetail.status === "Banned" ? (
                <Button className="flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 gap-1"><UserCheck className="h-4 w-4" /> Unban User</Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 rounded-xl gap-1 text-amber-foreground"><AlertTriangle className="h-4 w-4" /> Warn</Button>
                  <Button className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1"><Ban className="h-4 w-4" /> Ban User</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coordinator Detail Modal */}
      {showCoordDetail && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setShowCoordDetail(null)}>
          <div className="bg-card rounded-2xl p-6 w-[90%] max-w-md border border-border shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Coordinator Details</h3>
              <button onClick={() => setShowCoordDetail(null)} className="p-1.5 rounded-xl hover:bg-muted transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="text-center mb-5">
              <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-xl font-bold text-accent mx-auto mb-3">
                {showCoordDetail.name.split(" ").map(n => n[0]).join("")}
              </div>
              <p className="text-lg font-bold text-foreground">{showCoordDetail.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="h-4 w-4 text-amber fill-amber" />
                <span className="text-sm font-bold text-foreground">{showCoordDetail.rating}</span>
              </div>
              <Badge className={`text-xs mt-2 border ${statusColor(showCoordDetail.status)}`}>{showCoordDetail.status}</Badge>
            </div>
            <div className="space-y-3 bg-muted/20 rounded-xl p-4 border border-border/30">
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span><span className="text-xs font-semibold text-foreground">{showCoordDetail.email}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span><span className="text-xs font-semibold text-foreground">{showCoordDetail.phone}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Area</span><span className="text-xs font-semibold text-accent">{showCoordDetail.area}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined</span><span className="text-xs font-semibold text-foreground">{showCoordDetail.joinedDate}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center bg-accent/5 rounded-xl py-3 border border-accent/10">
                <p className="text-xl font-extrabold text-accent">{showCoordDetail.resolved}</p>
                <p className="text-[10px] text-muted-foreground">Resolved</p>
              </div>
              <div className="text-center bg-amber/5 rounded-xl py-3 border border-amber/10">
                <p className="text-xl font-extrabold text-amber">{showCoordDetail.pending}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="outline" className="flex-1 rounded-xl gap-1" onClick={() => {
                setShowCoordDetail(null); setEditCoord(showCoordDetail);
                setNewCoord({ name: showCoordDetail.name, email: showCoordDetail.email, area: showCoordDetail.area, phone: showCoordDetail.phone });
                setShowModal(true);
              }}><Edit3 className="h-4 w-4" /> Edit</Button>
              <Button className={`flex-1 rounded-xl gap-1 ${showCoordDetail.status === "Suspended" ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}>
                {showCoordDetail.status === "Suspended" ? <><RefreshCw className="h-4 w-4" /> Reactivate</> : <><Ban className="h-4 w-4" /> Suspend</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
