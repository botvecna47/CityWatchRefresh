import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { differenceInHours } from "date-fns";
import { Search, AlertCircle, Clock, Check, MoreVertical, X, CheckCircle2, Trash2, Filter, Users } from "lucide-react";
import { useAppContext, Report, User } from "../../store";
import { useAdmin } from "../../contexts/AdminContext";
import { Button, Input, Badge, cn } from "../../components/ui";
import { PaginationControls } from "../../components/PaginationControls";
import { toast } from "sonner";

export function IssuesManagement({ reports, users }: { reports: Report[], users: User[] }) {
  const { deleteReport, updateReport } = useAppContext();
  const { adminReportsPage, setAdminReportsPage, adminReportsTotalPages } = useAdmin();
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

  // Remove client-side slicing because the server already returns the correct page of 10 items.
  const paginatedReports = filtered;

  const selectedReport = reports.find(r => r.id === selectedIssueId);
  const assignedCoordinator = selectedReport?.coordinatorId ? users.find(u => u.id === selectedReport.coordinatorId) : null;

  useEffect(() => {
    if (selectedReport) setEditingStatus(selectedReport.status);
  }, [selectedIssueId, selectedReport]);

  return (
    <div className="space-y-6 relative">
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between transition-all">
        <div className="flex items-center gap-3 w-full xl:w-1/3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#1A4331]/20 focus-within:border-[#1A4331] transition-all">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            placeholder="Search issues by title..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium" 
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
          <Filter className="w-4 h-4 text-gray-400 hidden xl:block" />
          <select className="h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#1A4331]/20" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select className="h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#1A4331]/20" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Reported">Reported (New)</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#1A4331]/20" value={filterArea} onChange={e => setFilterArea(e.target.value)}>
            <option value="All">All Areas</option>
            {Array.from(new Set(reports.map(r => r.area))).filter(Boolean).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="h-10 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#1A4331]/20" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-5 font-bold">Issue Details</th>
              <th className="px-6 py-5 font-bold">Location</th>
              <th className="px-6 py-5 font-bold">Status & SLA</th>
              <th className="px-6 py-5 font-bold">Priority</th>
              <th className="px-6 py-5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedReports.map(r => {
              const hoursElapsed = differenceInHours(new Date(), new Date(r.createdAt));
              const isBreached = hoursElapsed > 48 && r.status !== "Completed";
              const isWarning = hoursElapsed > 24 && !isBreached && r.status !== "Completed";

              return (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedIssueId(r.id)}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1A4331] text-base group-hover:text-[#2E7D32] transition-colors">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Reported by <span className="font-semibold">{r.authorName}</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">{r.area}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <Badge className={cn(
                        "font-semibold px-2.5 py-0.5",
                        r.status === "Reported" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        r.status === "In Progress" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-green-50 text-green-700 border border-green-200"
                      )}>{r.status}</Badge>
                      {isBreached ? (
                         <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 uppercase tracking-wide"><AlertCircle className="w-3 h-3" /> Critical Delay ({hoursElapsed}h)</span>
                      ) : isWarning ? (
                         <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase tracking-wide"><Clock className="w-3 h-3" /> Delay Warning</span>
                      ) : r.status === "Completed" ? (
                         <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 uppercase tracking-wide"><Check className="w-3 h-3" /> Resolved</span>
                      ) : (
                         <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 uppercase tracking-wide"><Clock className="w-3 h-3" /> {48 - hoursElapsed}h remaining</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full", 
                        r.urgency === "High" ? "bg-red-50 text-red-700" : 
                        r.urgency === "Medium" ? "bg-amber-50 text-amber-700" : 
                        "bg-blue-50 text-blue-700")}>
                        <div className={cn("w-2 h-2 rounded-full", r.urgency === "High" ? "bg-red-500" : r.urgency === "Medium" ? "bg-amber-500" : "bg-blue-500")}></div>
                        {r.urgency}
                     </span>
                  </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 font-semibold border border-gray-200">
                        View <MoreVertical className="w-4 h-4 ml-1 text-gray-400" />
                      </Button>
                    </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">No civic issues found matching the selected criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls 
        currentPage={adminReportsPage} 
        totalPages={adminReportsTotalPages} 
        onPageChange={setAdminReportsPage} 
      />

      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A4331]/20 z-40 backdrop-blur-sm"
              onClick={() => setSelectedIssueId(null)}
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold text-[#1A4331] font-serif">Report Matrix</h2>
                <button onClick={() => setSelectedIssueId(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div>
                    <h3 className="font-bold text-2xl text-[#1A4331] mb-2 font-serif leading-tight">{selectedReport.title}</h3>
                    <p className="text-gray-600 text-sm font-medium mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedReport.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                       <Badge className="bg-[#1A4331]/10 text-[#1A4331] border-none font-semibold px-3 py-1">{selectedReport.area}</Badge>
                       <Badge variant="outline" className="font-semibold px-3 py-1 border-gray-200 text-gray-600">{selectedReport.urgency} Priority</Badge>
                       <Badge variant="outline" className="font-semibold px-3 py-1 border-gray-200 text-gray-600">{selectedReport.status}</Badge>
                    </div>
                 </div>

                 {selectedReport.image && (
                   <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Attached Evidence</p>
                      <img src={selectedReport.image} alt="Report" className="w-full h-48 object-cover rounded-2xl border border-gray-200 shadow-sm" />
                   </div>
                 )}

                 <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Users className="w-4 h-4" /> Assignment Details</p>
                    {assignedCoordinator ? (
                       <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-4">
                             <img src={assignedCoordinator.avatar} alt="Coordinator" className="w-12 h-12 rounded-full border border-gray-200" />
                             <div>
                                <p className="font-bold text-[#1A4331]">{assignedCoordinator.name}</p>
                                <p className="text-xs text-gray-500 font-medium">Coordinator • {assignedCoordinator.area}</p>
                             </div>
                          </div>
                          <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-xs font-bold border-gray-200 text-gray-600 hover:text-[#1A4331] hover:border-[#1A4331]/30"
                             onClick={async () => {
                               try {
                                 const token = localStorage.getItem("token");
                                 const res = await fetch(`http://localhost:8081/api/admin/complaints/${selectedReport.id}/resend-notification`, {
                                   method: 'POST',
                                   headers: { 'Authorization': `Bearer ${token}` }
                                 });
                                 if (res.ok) {
                                   toast.success("Reminder sent successfully!");
                                 } else {
                                   toast.error("Failed to send reminder");
                                 }
                               } catch(e) {
                                 toast.error("Error connecting to server");
                               }
                             }}
                          >Resend Reminder</Button>
                       </div>
                    ) : (
                       <p className="text-sm text-gray-500 font-medium italic">No coordinator assigned yet. Task is in queue.</p>
                    )}
                 </div>

                 {selectedReport.proofImage && (
                   <div className="bg-green-50 p-5 rounded-2xl border border-green-100 space-y-4">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Resolution Proof</p>
                      <img src={selectedReport.proofImage} alt="Proof" className="w-full h-48 object-cover rounded-xl border border-green-200 shadow-sm" />
                   </div>
                 )}
                 
                 <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
                     <select
                       value={editingStatus}
                       onChange={e => setEditingStatus(e.target.value)}
                       className="flex-1 h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm focus:ring-2 focus:ring-[#1A4331]/20 outline-none transition-all"
                     >
                       <option value="Reported">Reported</option>
                       <option value="In Progress">In Progress</option>
                       <option value="Completed">Completed</option>
                     </select>
                     <Button
                       className="h-12 px-6 rounded-xl bg-[#1A4331] hover:bg-[#2E7D32] text-white shadow-md font-semibold"
                       onClick={async () => {
                         if (selectedReport && editingStatus !== selectedReport.status) {
                           await updateReport(selectedReport.id, { status: editingStatus as any });
                           toast.success("Status updated successfully!");
                         }
                       }}
                     >Update</Button>
                     <Button
                       variant="outline"
                       className="h-12 w-12 p-0 rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                       onClick={() => {
                         if (selectedReport && window.confirm("Are you absolutely sure you want to delete this complaint permanently?")) {
                           deleteReport(selectedReport.id);
                           setSelectedIssueId(null);
                         }
                       }}
                     ><Trash2 className="w-5 h-5" /></Button>
                  </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
