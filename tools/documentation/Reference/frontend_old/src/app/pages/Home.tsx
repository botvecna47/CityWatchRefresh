import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MessageSquare, ArrowBigUp, ArrowBigDown, MapPin, Search, Filter, ShieldCheck, Map, BellRing } from "lucide-react";
import { useAppContext, Report, Status, Area } from "../store";
import { Card, Badge, cn, Button, Input } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export function Home() {
  const { reports, currentUser, updateReport, handleVote } = useAppContext();
  const navigate = useNavigate();
  const [filterArea, setFilterArea] = useState<Area | "All">("All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterUrgency, setFilterUrgency] = useState<"Low" | "Medium" | "High" | "All">("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredReports = reports.filter(r => {
    if (filterArea !== "All" && r.area !== filterArea) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterUrgency !== "All" && r.urgency !== filterUrgency) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const onVote = (id: string, type: 'up' | 'down') => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    handleVote(id, type);
  };

  // Dedicated Landing Page for logged out users
  if (!currentUser) {
    return (
      <div className="w-full flex flex-col gap-16 py-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1A4331] to-[#2E7D32] text-white p-8 sm:p-16 rounded-lg shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-3 py-1 uppercase tracking-widest text-xs font-bold font-serif hover:bg-white/30 cursor-default">
              Official Civic Reporting
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md" style={{ fontFamily: 'Playfair Display, serif' }}>
              Report. Resolve. <br/>Revitalize Our City.
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 font-serif leading-relaxed max-w-2xl text-center drop-shadow-sm">
              Join a premium community of citizens and coordinators dedicated to keeping our neighborhoods pristine. See an issue? Report it. We'll handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-[#1A4331] hover:bg-gray-100 font-bold px-10 h-14 text-lg shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* How it works section */}
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-bold text-[#1A4331] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>How CityWatch Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4331] mb-3">1. Pinpoint the Issue</h3>
              <p className="text-gray-600 font-serif text-sm">Snap a photo and mark the exact location on our advanced city map. Whether it's a pothole, broken streetlight, or illegal dumping.</p>
            </Card>

            <Card className="p-6 bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4331] mb-3">2. We Verify & Assign</h3>
              <p className="text-gray-600 font-serif text-sm">Our designated Area Coordinators immediately review your report, assign priority, and dispatch the right department to the scene.</p>
            </Card>

            <Card className="p-6 bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6">
                <BellRing className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1A4331] mb-3">3. Track Resolution</h3>
              <p className="text-gray-600 font-serif text-sm">Receive live updates pushed directly to your dashboard. Get notified the moment the issue is officially resolved and verified.</p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start relative">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 space-y-4">
        <Button 
          variant="outline" 
          className="md:hidden w-full flex justify-between items-center bg-white"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</span>
          <span className="text-xs text-gray-500">{showFilters ? "Hide" : "Show"}</span>
        </Button>

        <div className={cn("space-y-4", !showFilters && "hidden md:block")}>
          <Card className="p-4 bg-white border border-gray-200 shadow-sm">
            <div className="hidden md:flex items-center gap-2 font-bold text-[#1A4331] mb-4 border-b border-gray-100 pb-2">
              <Filter className="w-5 h-5" /> Filters
            </div>
            
            <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
              <Input 
                placeholder="Search issues..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Status | "All")}
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Area</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value as Area | "All")}
              >
                <option value="All">All Areas</option>
                <option value="North Area">North Area</option>
                <option value="South Area">South Area</option>
                <option value="East Area">East Area</option>
                <option value="West Area">West Area</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Urgency</label>
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value as any)}
              >
                <option value="All">All Urgency Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            {(filterStatus !== 'All' || filterArea !== 'All' || filterUrgency !== 'All' || search !== '') && (
              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={() => {
                  setFilterStatus('All');
                  setFilterArea('All');
                  setFilterUrgency('All');
                  setSearch('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      </div>
      </div>

      <div className="flex-1 space-y-6 w-full">
        {/* Main Feed Header */}
        <div id="feed" className="flex justify-between items-center bg-white p-4 shadow-sm border border-gray-100 rounded-sm">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A4331]" style={{ fontFamily: 'Playfair Display, serif' }}>
            CityWatch Feed
          </h2>
          <div className="flex gap-2">
            <Link to="/map">
              <Button className="bg-white text-gray-700 hover:bg-gray-50 gap-2 hidden sm:flex border border-gray-200">
                <Map className="w-4 h-4" /> Map View
              </Button>
            </Link>
            <Link to="/submit">
              <Button className="gap-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-sm">
                <span className="hidden sm:inline">Report Issue</span>
                <span className="sm:hidden">Report</span>
              </Button>
            </Link>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredReports.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-12 text-center text-gray-500 flex flex-col items-center gap-4 border border-dashed border-gray-300 shadow-none">
                <Search className="w-12 h-12 text-gray-300" />
                <p className="text-xl font-medium text-[#1A4331]">No reports found matching your criteria</p>
                <Button variant="outline" onClick={() => { setFilterStatus('All'); setFilterArea('All'); setFilterUrgency('All'); setSearch(''); }}>
                  Clear all filters
                </Button>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredReports.map((report, index) => {
                const userVote = report.userVotes?.[currentUser?.id || ""];

                return (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="flex hover:border-[#2E7D32]/30 transition-colors bg-white overflow-hidden shadow-sm">
                      {/* Voting Sidebar */}
                      <div className="w-14 bg-gray-50 flex flex-col items-center py-4 border-r border-gray-100 gap-1 flex-shrink-0">
                        <button 
                          onClick={() => onVote(report.id, 'up')} 
                          className={cn("p-1 transition-colors rounded hover:bg-gray-200", userVote === 'up' ? "text-[#2E7D32] bg-green-50" : "text-gray-400 hover:text-[#2E7D32]")}
                        >
                          <ArrowBigUp className="w-6 h-6" />
                        </button>
                        <span className="text-sm font-bold text-[#1A4331]">{report.upvotes - report.downvotes}</span>
                        <button 
                          onClick={() => onVote(report.id, 'down')} 
                          className={cn("p-1 transition-colors rounded hover:bg-gray-200", userVote === 'down' ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500")}
                        >
                          <ArrowBigDown className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <img src={report.authorAvatar} alt={report.authorName} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                          <div>
                            <span className="font-semibold text-[#1A4331] text-sm">{report.authorName}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="sm:ml-auto flex gap-2 w-full sm:w-auto items-center">
                            {currentUser?.role === 'coordinator' && report.status === 'Reported' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => { e.preventDefault(); updateReport(report.id, { status: "In Progress", coordinatorId: currentUser.id }); }}
                                className="h-6 text-xs px-2 border-[#1A4331] text-[#1A4331]"
                              >
                                Mark In Progress
                              </Button>
                            )}
                            <StatusBadge status={report.status} />
                            <Badge variant="outline" className="bg-[#1A4331]/5 text-[#1A4331] border-[#1A4331]/20">{report.area}</Badge>
                          </div>
                        </div>

                        <Link to={`/report/${report.id}`} className="block group">
                          <h2 className="text-xl font-bold mb-2 group-hover:text-[#2E7D32] transition-colors leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                            {report.title}
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-2 text-sm font-serif">
                            {report.description}
                          </p>
                          
                          {report.image && (
                            <div className="w-full h-48 sm:h-64 mb-4 overflow-hidden rounded-sm bg-gray-100 border border-gray-100">
                              <img src={report.image} alt="Issue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                        </Link>

                        <div className="flex items-center gap-6 mt-auto pt-4 border-t border-gray-100">
                          <Link to={`/report/${report.id}`} className="flex items-center gap-2 text-gray-500 hover:text-[#1A4331] text-sm font-medium transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            {report.comments.length} Comments
                          </Link>
                          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{report.locationText}</span>
                          </div>
                          {report.urgency === 'High' && (
                            <Badge className="ml-auto bg-red-100 text-red-700 hover:bg-red-100 border-0">High Urgency</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const colors = {
    "Reported": "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
    "Completed": "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <Badge variant="default" className={cn("font-medium border shadow-sm", colors[status])}>
      {status}
    </Badge>
  );
}