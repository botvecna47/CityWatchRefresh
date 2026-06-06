import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { Report } from "../../store";
import { Card, Button, Badge } from "../ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiClient as api } from "../../api/apiClient";

export function SupervisorDashboard({ reports }: { reports: Report[] }) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supervisors only see complaints in their area that are pending verification
  const pendingReports = reports.filter(r => r.status === "Pending Verification");

  const handleVerify = async (approved: boolean) => {
    if (!selectedReport) return;
    if (!approved && !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/supervisor/complaints/${selectedReport.id}/verify?approved=${approved}&reason=${encodeURIComponent(rejectReason)}`);
      toast.success(approved ? "Proof verified and completed!" : "Proof rejected and sent back.");
      setSelectedReport(null);
      setRejectReason("");
      // Realistically we'd call refreshReports() but it will sync shortly anyway
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to verify proof");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] font-serif mb-2">Verification Queue</h1>
          <p className="text-gray-500 font-medium">Review proofs submitted by coordinators in your area.</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-200 font-bold text-sm shadow-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {pendingReports.length} {pendingReports.length === 1 ? 'Proof' : 'Proofs'} Pending
        </div>
      </div>

      {pendingReports.length === 0 ? (
        <Card className="p-12 text-center bg-gray-50 border border-gray-100 shadow-inner rounded-3xl">
          <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2 font-serif">All Caught Up!</h3>
          <p className="text-gray-500 font-medium">There are no proofs awaiting your verification.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingReports.map(report => (
            <Card key={report.id} className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-3 py-1">Pending Verification</Badge>
                  <span className="text-xs text-gray-500 font-bold">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-[#1A4331] text-lg font-serif mb-1">{report.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{report.description}</p>
              </div>
              <Button onClick={() => setSelectedReport(report)} className="bg-[#1A4331] hover:bg-[#2E7D32] text-white font-bold rounded-xl whitespace-nowrap shadow-md">
                Review Proof
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#1A4331]/20 backdrop-blur-sm z-40" onClick={() => setSelectedReport(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-4xl bg-white shadow-2xl z-50 rounded-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A4331] font-serif mb-1">Verify Resolution</h2>
                  <p className="text-sm text-gray-500 font-medium">Review the proof submitted by the coordinator.</p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-gray-400" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50">
                {/* Image Proof */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#1A4331]" /> Visual Proof
                  </h3>
                  <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
                    {selectedReport.proofImage ? (
                      <img src={selectedReport.proofImage} alt="Proof" className="w-full h-64 object-cover rounded-xl" />
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                        No image submitted
                      </div>
                    )}
                  </div>
                </div>

                {/* PDF Proof */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" /> Resolution Report (PDF)
                  </h3>
                  <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm h-64">
                    {selectedReport.resolutionPdfUrl ? (
                      <iframe src={selectedReport.resolutionPdfUrl} className="w-full h-full rounded-xl" title="PDF Proof" />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                        No PDF submitted
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-white space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Rejection Reason (if rejecting)</label>
                  <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="E.g., The area is still dirty, please clean thoroughly." className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:ring-2 focus:ring-[#1A4331]/20 outline-none transition-all" />
                </div>
                
                <div className="flex gap-4 pt-2">
                  <Button onClick={() => handleVerify(false)} disabled={isSubmitting} variant="outline" className="flex-1 h-12 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl text-lg">
                    Reject & Reopen
                  </Button>
                  <Button onClick={() => handleVerify(true)} disabled={isSubmitting} className="flex-1 h-12 bg-[#1A4331] text-white hover:bg-[#2E7D32] font-bold rounded-xl text-lg shadow-md">
                    Approve & Verify
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
