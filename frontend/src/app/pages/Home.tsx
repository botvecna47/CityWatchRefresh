import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MessageSquare, ArrowBigUp, ArrowBigDown, MapPin, Search, Filter, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAppContext, Report, Status, Area } from "../store";
import { Card, Badge, cn, Button, Input, Skeleton } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export function Home() {
  const { reports, currentUser, loading, handleVote: voteOnServer, updateReport } = useAppContext();
  const availableAreas = ["All", ...Array.from(new Set(reports.map(r => r.area).filter(Boolean)))];
  const navigate = useNavigate();
  const [filterArea, setFilterArea] = useState<Area | "All">(localStorage.getItem("feed_filterArea") || "All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">((localStorage.getItem("feed_filterStatus") as Status | "All") || "All");
  const [filterUrgency, setFilterUrgency] = useState<"Low" | "Medium" | "High" | "All">((localStorage.getItem("feed_filterUrgency") as any) || "All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    localStorage.setItem("feed_filterArea", filterArea);
    localStorage.setItem("feed_filterStatus", filterStatus);
    localStorage.setItem("feed_filterUrgency", filterUrgency);
  }, [filterArea, filterStatus, filterUrgency]);

  const filteredReports = reports.filter(r => {
    if (filterArea !== "All" && r.area !== filterArea) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterUrgency !== "All" && r.urgency !== filterUrgency) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleVoteAction = async (id: string, type: 'up' | 'down') => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role === 'admin') { toast.error("Admins cannot upvote complaints."); return; }
    if (type === 'up') {
      await voteOnServer(id, currentUser.id);
    } else {
      toast.info("Downvoting is coming soon!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start relative">
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
                {availableAreas.map(area => (
                  <option key={area} value={area}>{area === 'All' ? 'All Areas' : area}</option>
                ))}
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
        {!currentUser && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#1A4331] to-[#2E7D32] text-white p-8 sm:p-12 rounded-lg shadow-lg relative overflow-hidden mb-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Report. Resolve. <br/>Revitalize Our City.
              </h1>
              <p className="text-lg text-white/90 mb-8 font-serif leading-relaxed max-w-xl">
                Join a premium community of citizens and coordinators dedicated to keeping our neighborhoods pristine. See an issue? Report it. We'll handle the rest.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-[#1A4331] hover:bg-gray-100 font-bold px-8">
                    Get Started
                  </Button>
                </Link>
                <a href="#feed">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 px-8">
                    Browse Feed
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <div id="feed" className="flex justify-between items-center bg-white p-4 shadow-sm border border-gray-100 rounded-sm">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A4331]" style={{ fontFamily: 'Playfair Display, serif' }}>
            CityWatch Feed
          </h2>
          <div className="flex gap-2">
            <Link to={currentUser ? "/submit" : "/auth"}>
              <Button className="gap-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-sm">
                <span className="hidden sm:inline">{currentUser ? "Report Issue" : "Sign In to Report"}</span>
                <span className="sm:hidden">Report</span>
              </Button>
            </Link>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="flex bg-white overflow-hidden shadow-sm p-5 animate-pulse">
                  <div className="w-14 bg-gray-50 mr-4 rounded h-32"></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
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
              {filteredReports.map((report, index) => (
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
                        onClick={() => handleVoteAction(report.id, 'up')} 
                        className={cn(
                          "p-1 transition-colors rounded hover:bg-gray-200",
                          currentUser && report.upvotedCitizenIds?.includes(currentUser.id) ? "text-[#2E7D32]" : "text-gray-400 hover:text-[#2E7D32]"
                        )}
                      >
                        <ArrowBigUp className="w-6 h-6" />
                      </button>
                      <span className="text-sm font-bold text-[#1A4331]">{report.upvotes}</span>
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

                      <button onClick={() => navigate(`/report/${report.id}`)} className="block group text-left w-full">
                        <h2 className="text-xl font-bold mb-2 group-hover:text-[#2E7D32] transition-colors leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {report.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm font-serif">
                          {report.description}
                        </p>
                        
                        {report.image && (
                          <div className="w-full h-48 sm:h-64 mb-4 overflow-hidden rounded-sm bg-gray-100 border border-gray-100 relative group">
                            <img src={report.image} alt="Issue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {report.additionalImages && report.additionalImages.length > 0 && (
                              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <Camera className="w-3 h-3" />
                                +{report.additionalImages.length} MORE PHOTOS
                              </div>
                            )}
                          </div>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-auto pt-4 border-t border-gray-100">
                        <button onClick={() => navigate(`/report/${report.id}`)} className="flex items-center gap-2 text-gray-500 hover:text-[#1A4331] text-sm font-medium transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {report.comments.length} Comments
                        </button>
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
              ))}
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
    <Badge className={cn("font-medium border shadow-sm", colors[status])}>
      {status}
    </Badge>
  );
}