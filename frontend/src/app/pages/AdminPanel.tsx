import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/ui";
import { useAppContext } from "../store";

import { AdminOverview } from "../components/admin/AdminOverview";
import { IssuesManagement } from "../components/admin/IssuesManagement";
import { CoordinatorManagement } from "../components/admin/CoordinatorManagement";
import { UserManagement } from "../components/admin/UserManagement";
import { ApplicationsManagement } from "../components/admin/ApplicationsManagement";
import { SpamManagement } from "../components/admin/SpamManagement";
import { SystemManagement } from "../components/admin/SystemManagement";
import { ServerMonitor } from "../components/admin/ServerMonitor";

export function AdminPanel() {
  const { users, currentUser, reports, applications, spamReports } = useAppContext();
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "coordinators" | "users" | "applications" | "spam" | "system" | "monitor">("overview");

  if (currentUser?.role !== "admin") {
    return <div className="p-8 text-center text-red-500 font-bold font-serif bg-red-50 border border-red-200 rounded-sm">Access Denied. Administrator privileges required.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Command Center</h1>
          <p className="text-gray-600 font-serif">City-level overview and tactical administration.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        {(["overview", "issues", "coordinators", "users", "applications", "spam", "system", "monitor"] as const).map(tab => {
          let badgeCount = 0;
          if (tab === "applications") badgeCount = applications.filter(a => a.status === "pending").length;
          if (tab === "spam") badgeCount = spamReports.filter(s => s.status === "pending").length;
          if (tab === "issues") badgeCount = reports.filter(r => r.urgency === "High" && r.status !== "Completed").length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-selected={activeTab === tab}
              role="tab"
              className={cn(
                "px-4 py-2 font-medium text-sm transition-all border-b-2 font-serif capitalize tracking-wide flex items-center gap-2",
                activeTab === tab 
                  ? "border-[#1A4331] text-[#1A4331] bg-[#1A4331]/5" 
                  : "border-transparent text-gray-500 hover:text-[#1A4331] hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {tab === "system" ? "System Config" : tab === "monitor" ? "🖥 Monitor" : tab}
              {badgeCount > 0 && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full shadow-sm text-white", tab === 'issues' ? 'bg-amber-500' : 'bg-red-500')}>{badgeCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="relative outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {activeTab === "overview" && <AdminOverview reports={reports} users={users} />}
            {activeTab === "issues" && <IssuesManagement reports={reports} users={users} />}
            {activeTab === "coordinators" && <CoordinatorManagement users={users.filter(u => u.role === "coordinator")} reports={reports} />}
            {activeTab === "users" && <UserManagement users={users.filter(u => u.role === "citizen")} title="Citizen Directory" />}
            {activeTab === "applications" && <ApplicationsManagement />}
            {activeTab === "spam" && <SpamManagement />}
            {activeTab === "system" && <SystemManagement />}
            {activeTab === "monitor" && <ServerMonitor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
