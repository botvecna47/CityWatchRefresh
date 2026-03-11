import { useState } from "react";
import { mockReports } from "@/data/mockData";
import IssueCard from "@/components/complaint/ComplaintCard";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const statuses = ["All", "Reported", "In Progress", "Completed"] as const;
const areas = ["All", "North Area", "South Area", "East Area"] as const;

const ReportsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [areaFilter, setAreaFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = mockReports.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (areaFilter !== "All" && r.area !== areaFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Community Reports</h1>
        <p className="text-muted-foreground">Browse and engage with civic issues reported by citizens</p>
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-4 mb-6 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <button
                key={a}
                onClick={() => setAreaFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  areaFilter === a
                    ? "bg-forest text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((report) => (
          <IssueCard key={report.id} report={report} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No reports found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
