import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppContext, Status, Area } from "../store";
import { Card, Button, cn, Skeleton } from "../components/ui";
import { motion, AnimatePresence } from "motion/react";

import { FeedFilters } from "../components/feed/FeedFilters";
import { FeedItem } from "../components/feed/FeedItem";

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
          <FeedFilters 
            search={search} setSearch={setSearch}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            filterArea={filterArea} setFilterArea={setFilterArea}
            filterUrgency={filterUrgency} setFilterUrgency={setFilterUrgency}
            availableAreas={availableAreas}
          />
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
                  <FeedItem 
                    report={report} 
                    currentUser={currentUser} 
                    handleVoteAction={handleVoteAction} 
                    updateReport={updateReport} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}