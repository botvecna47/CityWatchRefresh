import { useState } from "react";
import { CheckCircle2, AlertCircle, Trash2, Check } from "lucide-react";
import { useAppContext } from "../../store";
import { Card, Button, Badge } from "../../components/ui";

export function SpamManagement() {
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
            className="h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-[#1A4331]/20 outline-none transition-all"
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
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          System is clean. No pending abuse reports.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingSpam.map(spam => (
            <Card key={spam.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="destructive" className="uppercase text-[10px] tracking-widest font-bold px-2 py-0.5 rounded-md">{spam.targetType}</Badge>
                  <span className="text-sm font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 shadow-sm">Target ID: {spam.targetId}</span>
                  <span className="text-xs font-semibold text-gray-400 ml-2">{spam.createdAt ? new Date(spam.createdAt).toLocaleDateString() : "Pending Date"}</span>
                </div>
                <p className="text-[#1A4331] font-serif text-lg">Reported by <span className="font-bold">{spam.reporterName}</span></p>
                <p className="text-gray-700 text-sm mt-3 bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2 shadow-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  {spam.reason}
                </p>
              </div>
              <div className="w-full sm:w-auto flex flex-col gap-2">
                {spam.targetType === 'report' && (
                  <Button size="sm" onClick={() => {
                    if (window.confirm("Are you sure you want to delete the associated post? This will softly wipe it from feeds.")) {
                      deleteReport(spam.targetId, spam.id);
                    }
                  }} variant="outline" className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 h-10 rounded-xl font-bold shadow-sm">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Post
                  </Button>
                )}
                <Button size="sm" onClick={() => resolveSpamReport(spam.id)} variant="outline" className="w-full sm:w-auto border-green-200 text-green-700 hover:bg-green-50 h-10 rounded-xl font-bold shadow-sm">
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
