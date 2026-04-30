import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { differenceInHours } from "date-fns";
import { Search, AlertCircle, Clock, Check, MoreVertical, X, CheckCircle2, Trash2 } from "lucide-react";
import { useAppContext, Report, User } from "../../store";
import { Button, Input, Badge, cn } from "../../components/ui";
import { toast } from "sonner";

export function IssuesManagement({ reports, users }: { reports: Report[], users: User[] }) {
  const { deleteReport, updateReport } = useAppContext();
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterUrgency, setFilterUrgency] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<string>("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");

  const filtered = reports.filter(r => {
    if (filterArea !== "All" && r.area !== filterArea) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterUrgency !== "All" && r.urgency !== filterUrgency) return false;
    if (filterDate !== "All") {
      const daysElapsed = differenceInHours(new Date(), new Date(r.createdAt)) / 24;
      if (filterDate === "Today" && daysElapsed > 1) return false;
      if (filterDate === "Week" && daysElapsed > 7) return false;
      if (filterDate === "Month" && daysElapsed > 30) return false;
    }
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedReport = reports.find(r => r.id === selectedIssueId);
  const assignedCoordinator = selectedReport?.coordinatorId ? users.find(u => u.id === selectedReport.coordinatorId) : null;

  useEffect(() => {
    if (selectedReport) setEditingStatus(selectedReport.status);
  }, [selectedIssueId, selectedReport]);

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <Input placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} className="h-9 w-full md:max-w-xs" />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Reported">Reported (New)</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterArea} onChange={e => setFilterArea(e.target.value)}>
            <option value="All">All Areas</option>
            {Array.from(new Set(reports.map(r => r.area))).filter(Boolean).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-serif" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm font-serif min-w-[800px]">
          <thead className="bg-[#FDFDF7] border-b border-gray-200 text-gray-600">
            <tr>
              <th className="p-4 font-medium">Issue</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status & SLA</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(r => {
              const hoursElapsed = differenceInHours(new Date(), new Date(r.createdAt));
              const isBreached = hoursElapsed > 48 && r.status !== "Completed";
              const isWarning = hoursElapsed > 24 && !isBreached && r.status !== "Completed";

              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedIssueId(r.id)}>
                  <td className="p-4">
                    <p className="font-bold text-[#1A4331]">{r.title}</p>
                    <p className="text-xs text-gray-500">Reported by {r.authorName}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-gray-50">{r.area}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge className={cn(
                        "font-medium",
                        r.status === "Reported" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                        r.status === "In Progress" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                        "bg-green-100 text-green-800 hover:bg-green-100"
                      )}>{r.status}</Badge>
                      {isBreached ? (
                         <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> SLA Breach ({hoursElapsed}h)</span>
                      ) : isWarning ? (
                         <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> SLA Warning</span>
                      ) : r.status === "Completed" ? (
                         <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Resolved</span>
                      ) : (
                         <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {48 - hoursElapsed}h remaining</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                     <span className={cn("inline-flex items-center gap-1 text-xs font-bold", r.urgency === "High" ? "text-red-600" : r.urgency === "Medium" ? "text-amber-600" : "text-blue-600")}>
                        <div className={cn("w-2 h-2 rounded-full", r.urgency === "High" ? "bg-red-500" : r.urgency === "Medium" ? "bg-amber-500" : "bg-blue-500")}></div>
                        {r.urgency}
                     </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8">View <MoreVertical className="w-4 h-4 ml-1" /></Button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No issues found matching criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setSelectedIssueId(null)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-[#1A4331] font-serif">Report Matrix</h2>
                <button onClick={() => setSelectedIssueId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="font-bold text-2xl text-[#1A4331] mb-2 font-serif leading-tight">{selectedReport.title}</h3>
                    <p className="text-gray-600 text-sm font-serif mb-4">{selectedReport.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                       <Badge className="bg-[#1A4331]/10 text-[#1A4331] border-none">{selectedReport.area}</Badge>
                       <Badge variant="outline">{selectedReport.urgency} Priority</Badge>
                       <Badge variant="outline">{selectedReport.status}</Badge>
                    </div>
                 </div>

                 {selectedReport.image && (
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attached Evidence</p>
                      <img src={selectedReport.image} alt="Report" className="w-full h-48 object-cover rounded-sm border border-gray-200" />
                   </div>
                 )}

                 <div className="bg-gray-50 p-4 rounded-sm border border-gray-200 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment Details</p>
                    {assignedCoordinator ? (
                       <div className="flex items-center gap-3">
                          <img src={assignedCoordinator.avatar} alt="Coordinator" className="w-10 h-10 rounded-full border border-gray-300" />
                          <div>
                             <p className="font-bold text-[#1A4331] text-sm">{assignedCoordinator.name}</p>
                             <p className="text-xs text-gray-500">Coordinator • {assignedCoordinator.area}</p>
                          </div>
                       </div>
                    ) : (
                       <p className="text-sm text-gray-600 italic">No coordinator assigned yet.</p>
                    )}
                 </div>

                 {selectedReport.proofImage && (
                   <div className="bg-green-50 p-4 rounded-sm border border-green-200">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Resolution Proof</p>
                      <img src={selectedReport.proofImage} alt="Proof" className="w-full h-48 object-cover rounded-sm border border-green-300" />
                   </div>
                 )}
                 
                 <div className="pt-4 flex gap-2">
                     <select
                       value={editingStatus}
                       onChange={e => setEditingStatus(e.target.value)}
                       className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm font-serif"
                     >
                       <option value="Reported">Reported</option>
                       <option value="In Progress">In Progress</option>
                       <option value="Completed">Completed</option>
                     </select>
                     <Button
                       className="bg-[#1A4331] hover:bg-[#112d21]"
                       onClick={async () => {
                         if (selectedReport && editingStatus !== selectedReport.status) {
                           await updateReport(selectedReport.id, { status: editingStatus as any });
                           toast.success("Status updated!");
                         }
                       }}
                     >Update</Button>
                     <Button
                       variant="outline"
                       className="text-red-600 border-red-200 hover:bg-red-50"
                       onClick={() => {
                         if (selectedReport && window.confirm("Delete this complaint permanently?")) {
                           deleteReport(selectedReport.id);
                           setSelectedIssueId(null);
                         }
                       }}
                     ><Trash2 className="w-4 h-4" /></Button>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
