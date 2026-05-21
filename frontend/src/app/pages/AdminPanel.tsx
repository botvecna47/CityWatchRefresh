import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, LayoutDashboard, AlertTriangle, Users, Shield, FileText, Settings, Activity, Server, ClipboardList } from "lucide-react";
import { cn, Button } from "../components/ui";
import { useAppContext } from "../store";
import { useAdmin } from "../contexts/AdminContext";

import { AdminOverview } from "../components/admin/AdminOverview";
import { IssuesManagement } from "../components/admin/IssuesManagement";
import { CoordinatorManagement } from "../components/admin/CoordinatorManagement";
import { UserManagement } from "../components/admin/UserManagement";
import { ApplicationsManagement } from "../components/admin/ApplicationsManagement";
import { SpamManagement } from "../components/admin/SpamManagement";
import { SystemManagement } from "../components/admin/SystemManagement";
import { ServerMonitor } from "../components/admin/ServerMonitor";
import { AuditLogsManagement } from "../components/admin/AuditLogsManagement";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "coordinators", label: "Coordinators", icon: Shield },
  { id: "users", label: "Citizens", icon: Users },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "spam", label: "Spam", icon: Activity },
  { id: "audit", label: "Audit Logs", icon: ClipboardList },
  { id: "system", label: "System Config", icon: Settings },
  { id: "monitor", label: "Server Monitor", icon: Server },
] as const;

export function AdminPanel() {
  const { users, usersLoading, currentUser, reports, applications, spamReports, refreshUsers, refreshApplications, refreshSpamReports } = useAppContext();
  const { adminReports, refreshAdminReports, adminReportsPage, usersPage, refreshAuditLogs } = useAdmin();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("overview");

  useEffect(() => {
    refreshAdminReports(adminReportsPage);
  }, [adminReportsPage]);

  useEffect(() => {
    refreshUsers(usersPage);
  }, [usersPage]);

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 font-serif mb-2">Access Denied</h2>
          <p className="text-red-600/80 text-sm">Administrator privileges are required to access the Command Center.</p>
        </div>
      </div>
    );
  }

  const handleRefreshAll = () => {
    refreshUsers();
    refreshApplications();
    refreshSpamReports();
    refreshAdminReports(adminReportsPage);
    refreshAuditLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6 md:pt-8 space-y-6 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/50 p-6 rounded-3xl border border-gray-100 shadow-sm backdrop-blur-sm">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A4331] mb-2 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Command Center</h1>
          <p className="text-gray-600 font-serif text-lg">City-level overview and tactical administration.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshAll}
          disabled={usersLoading}
          className="gap-2 text-sm font-semibold h-11 px-6 rounded-full border-[#1A4331]/20 text-[#1A4331] hover:bg-[#1A4331] hover:text-white transition-all hover:shadow-md"
        >
          <RefreshCw className={cn("w-4 h-4", usersLoading && "animate-spin")} />
          {usersLoading ? "Syncing..." : "Sync Data"}
        </Button>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => {
            let badgeCount = 0;
            if (tab.id === "applications") badgeCount = applications.filter(a => a.status === "pending").length;
            if (tab.id === "spam") badgeCount = spamReports.filter(s => s.status === "pending").length;
            if (tab.id === "issues") badgeCount = reports.filter(r => r.urgency === "High" && r.status !== "Completed").length;

            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive}
                role="tab"
                className={cn(
                  "relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 group",
                  isActive 
                    ? "text-white" 
                    : "text-gray-500 hover:text-[#1A4331] hover:bg-gray-50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="adminTabIndicator" 
                    className="absolute inset-0 bg-[#1A4331] rounded-xl" 
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", isActive ? "text-white/80" : "text-gray-400 group-hover:text-[#1A4331]/70")} />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm", 
                      isActive 
                        ? (tab.id === 'issues' ? 'bg-white text-amber-600' : 'bg-white text-red-600')
                        : (tab.id === 'issues' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')
                    )}>
                      {badgeCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="relative outline-none min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === "overview" && <AdminOverview reports={adminReports} users={users} />}
            {activeTab === "issues" && <IssuesManagement reports={adminReports} users={users} />}
            {activeTab === "coordinators" && <CoordinatorManagement users={users.filter(u => u.role === "coordinator")} reports={adminReports} />}
            {activeTab === "users" && <UserManagement users={users.filter(u => u.role === "citizen")} title="Citizen Directory" />}
            {activeTab === "applications" && <ApplicationsManagement />}
            {activeTab === "spam" && <SpamManagement />}
            {activeTab === "audit" && <AuditLogsManagement />}
            {activeTab === "system" && <SystemManagement />}
            {activeTab === "monitor" && <ServerMonitor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
