import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { Report } from "../../store";
import { Card, Button } from "../../components/ui";
import { ReportSummaryCard } from "./ReportSummaryCard";

export function CitizenDashboard({ reports }: { reports: Report[] }) {

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
            <ReportSummaryCard key={r.id} report={r} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
