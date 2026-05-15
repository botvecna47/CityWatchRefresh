import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppContext, Status, Area } from "../store";
import { Card, Button, cn, Skeleton } from "../components/ui";
import { motion, AnimatePresence } from "motion/react";

import { FeedFilters } from "../components/feed/FeedFilters";
import { FeedItem } from "../components/feed/FeedItem";

export function Home() {
  const { reports, currentUser, loading, handleVote: voteOnServer, updateReport, refreshReports } = useAppContext();
  const availableAreas = ["All", ...Array.from(new Set(reports.map(r => r.area).filter(Boolean)))];
  const navigate = useNavigate();
  const [filterArea, setFilterArea] = useState<Area | "All">(localStorage.getItem("feed_filterArea") || "All");
  const [filterStatus, setFilterStatus] = useState<Status | "All">((localStorage.getItem("feed_filterStatus") as Status | "All") || "All");
  const [filterUrgency, setFilterUrgency] = useState<"Low" | "Medium" | "High" | "All">((localStorage.getItem("feed_filterUrgency") as any) || "All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Infinite Scroll State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("feed_filterArea", filterArea);
    localStorage.setItem("feed_filterStatus", filterStatus);
    localStorage.setItem("feed_filterUrgency", filterUrgency);
  }, [filterArea, filterStatus, filterUrgency]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const res = await refreshReports(true, nextPage, 5);
    if (res && res.last) setHasMore(false);
    setPage(nextPage);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading, page]);

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
    <div className="flex justify-center relative w-full pt-4 md:pt-6 gap-8 px-4 xl:px-8">
      {/* Center Main Feed */}
      <div className="flex-1 w-full max-w-2xl xl:max-w-3xl">

        <div id="feed" className="flex justify-between items-center bg-white p-4 shadow-sm border-y sm:border border-gray-100 rounded-none sm:rounded-sm mb-4">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1A4331]" style={{ fontFamily: 'Playfair Display, serif' }}>
            CityWatch Feed
          </h2>
          <div className="flex gap-2">
            <Link to={currentUser ? "/submit" : "/auth"}>
              <Button className="gap-2 bg-[#2E7D32] hover:bg-[#1b5e20] text-white shadow-sm h-9 sm:h-10 px-3 sm:px-4">
                <span className="hidden sm:inline">{currentUser ? "Report Issue" : "Sign In"}</span>
                <span className="sm:hidden text-xs">Report</span>
              </Button>
            </Link>
          </div>
        </div>

        <FeedFilters 
          search={search} setSearch={setSearch}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterArea={filterArea} setFilterArea={setFilterArea}
          filterUrgency={filterUrgency} setFilterUrgency={setFilterUrgency}
          availableAreas={availableAreas}
        />

        <div className="space-y-6">
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
              
              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div 
                  ref={observerTarget}
                  className="w-full h-20 flex items-center justify-center py-4"
                >
                  {isLoadingMore && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D32]"></div>}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar (Trends/Stats) */}
      <div className="hidden lg:block w-[300px] xl:w-[350px] flex-shrink-0 space-y-6 sticky top-6 self-start">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-[#1A4331]">What's happening</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Trending in your city</p>
              <p className="font-bold text-sm">#RoadRepair</p>
              <p className="text-xs text-gray-400">1.2k reports</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Civic Updates</p>
              <p className="font-bold text-sm">Water supply restoration</p>
              <p className="text-xs text-gray-400">Downtown area</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Community</p>
              <p className="font-bold text-sm">Park Clean-up Drive</p>
              <p className="text-xs text-gray-400">This Sunday, 9 AM</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A4331] rounded-xl p-4 shadow-sm text-white">
          <h3 className="font-bold text-lg mb-2">Join as Coordinator</h3>
          <p className="text-sm mb-4 opacity-90">Help verify reports and coordinate with authorities in your area.</p>
          <Button className="bg-white text-[#1A4331] hover:bg-gray-100 w-full font-bold rounded-xl shadow-none">
            Apply Now
          </Button>
        </div>
        
        <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1 px-2">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <span>Cookie Policy</span>
          <span>Accessibility</span>
          <span>© 2026 CityWatch</span>
        </div>
      </div>
    </div>
  );
}