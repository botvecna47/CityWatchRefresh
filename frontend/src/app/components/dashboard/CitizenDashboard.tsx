import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, Star, BarChart3 } from "lucide-react";
import { Report } from "../../store";
import { Card, Button } from "../../components/ui";
import { ReportSummaryCard } from "./ReportSummaryCard";

export function CitizenDashboard({ reports }: { reports: Report[] }) {
  const [ratingModal, setRatingModal] = useState<string | null>(null);

  const pending = reports.filter(r => r.status !== "Completed");
  const completed = reports.filter(r => r.status === "Completed");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>My Submissions</h1>
        <p className="text-gray-600 font-serif">Track the progress of issues you've reported.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Total Reports</p>
            <p className="text-3xl font-bold text-[#1A4331]">{reports.length}</p>
          </div>
          <BarChart3 className="w-10 h-10 text-gray-200" />
        </Card>
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-amber-600 font-bold mb-1">In Progress</p>
            <p className="text-3xl font-bold text-[#1A4331]">{pending.length}</p>
          </div>
          <Clock className="w-10 h-10 text-amber-100" />
        </Card>
        <Card className="p-4 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600 font-bold mb-1">Resolved</p>
            <p className="text-3xl font-bold text-[#1A4331]">{completed.length}</p>
          </div>
          <CheckCircle2 className="w-10 h-10 text-green-100" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A4331] flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Clock className="w-5 h-5 text-amber-500" /> Active Issues
          </h2>
          {pending.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">No active reports.</p>}
          {pending.map(r => (
            <ReportSummaryCard key={r.id} report={r} />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1A4331] flex items-center gap-2 border-b border-gray-200 pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Resolved
          </h2>
          {completed.length === 0 && <p className="text-gray-500 text-sm font-serif italic bg-white p-4 rounded-sm border border-gray-100">No completed reports yet.</p>}
          {completed.map(r => (
            <div key={r.id} className="relative group">
              <ReportSummaryCard report={r} />
              {r.coordinatorId && (
                <Button 
                  onClick={() => setRatingModal(r.id)}
                  size="sm"
                  className="absolute top-4 right-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#2E7D32]"
                >
                  <Star className="w-3 h-3" fill="white" /> Rate Resolution
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {ratingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl animate-in zoom-in-95 duration-200 border border-gray-200">
            <h3 className="text-xl font-bold text-[#1A4331] mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Rate Coordinator</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-serif">How satisfied are you with the resolution of this issue?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} className="p-2 hover:scale-110 transition-transform focus:outline-none group">
                  <Star className="w-8 h-8 text-gray-300 group-hover:text-yellow-400 group-focus:text-yellow-400 transition-colors" />
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRatingModal(null)}>Cancel</Button>
              <Button onClick={() => setRatingModal(null)} className="bg-[#1A4331] hover:bg-[#112d21] text-white">Submit Rating</Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
