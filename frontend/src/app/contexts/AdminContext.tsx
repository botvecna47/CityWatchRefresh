import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { User, CoordinatorApplication, SpamReport, Role, AuditLog } from "../types";
import { adminService, applicationService, spamService, complaintService, auditLogService } from "../api/services";

interface AdminContextType {
  users: User[];
  usersLoading: boolean;
  applications: CoordinatorApplication[];
  spamReports: SpamReport[];
  usersTotalPages: number;
  usersPage: number;
  setUsersPage: (page: number) => void;
  adminReports: Report[];
  adminReportsLoading: boolean;
  adminReportsTotalPages: number;
  adminReportsPage: number;
  setAdminReportsPage: (page: number) => void;
  refreshUsers: (page?: number) => void;
  refreshAdminReports: (page?: number) => void;
  refreshApplications: () => void;
  refreshSpamReports: () => void;
  submitApplication: (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => void;
  updateApplicationStatus: (id: string, status: "approved" | "rejected", areaId?: number) => void;
  assignCoordinatorToReport: (reportId: string, coordinatorId: string, refreshReports: () => void) => Promise<void>;
  submitSpamReport: (report: Omit<SpamReport, "id" | "status" | "createdAt">) => void;
  resolveSpamReport: (id: string) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  auditLogs: AuditLog[];
  auditLogsLoading: boolean;
  refreshAuditLogs: () => void;
}

// AdminContext is kept internal — consumers use the useAdmin() hook
const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [adminReports, setAdminReports] = useState<Report[]>([]);
  const [adminReportsLoading, setAdminReportsLoading] = useState(false);
  const [adminReportsPage, setAdminReportsPage] = useState(0);
  const [adminReportsTotalPages, setAdminReportsTotalPages] = useState(1);
  const [applications, setApplications] = useState<CoordinatorApplication[]>([]);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const refreshUsers = (page = 0) => {
    setUsersLoading(true);
    adminService.getUsers(page, 100)  // fetch up to 100 users so all appear in the admin panel
      .then((res: any) => {
        const data = res.content || [];
        setUsersTotalPages(res.totalPages || 1);
        setUsers(data.map((u: any) => ({
          id: String(u.id), name: u.username || "Unknown", email: u.email, role: (u.role || "citizen").toLowerCase() as Role,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.username || u.email)}`,
          status: (u.status || "ACTIVE").toUpperCase() === "ACTIVE" ? "active" : "banned" as "active" | "banned",
          area: u.areaName || undefined, settings: { emailNotifications: true, smsNotifications: false, theme: "system" as const }
        })));
      })
      .catch((err) => {
        console.error("[AdminContext] refreshUsers failed:", err);
        toast.error("Failed to load users. Check backend connection.");
      })
      .finally(() => setUsersLoading(false));
  };

  const mapStatus = (s: string) => {
    switch ((s || "").toUpperCase()) {
      case "IN_PROGRESS": case "ASSIGNED": return "In Progress";
      case "COMPLETED": case "CLOSED": return "Completed";
      default: return "Reported";
    }
  };

  const mapPriority = (p: string) => {
    switch ((p || "").toUpperCase()) {
      case "HIGH": return "High";
      case "MEDIUM": return "Medium";
      default: return "Low";
    }
  };

  const refreshAdminReports = (page = 0) => {
    setAdminReportsLoading(true);
    adminService.getComplaints(page, 10)
      .then((res: any) => {
        setAdminReportsTotalPages(res.totalPages || 1);
        let data = res.content || res;
        if (!Array.isArray(data)) data = [];
        setAdminReports(data.map((r: any) => ({
          id: String(r.id), title: r.title || (r.category ? r.category.replace(/_/g, " ") : "Reported Issue"),
          description: r.description || "", image: r.imageUrls?.length > 0 ? r.imageUrls[0] : "", additionalImages: r.imageUrls?.slice(1) || [],
          locationText: r.locationText || (r.areaName ? `${r.areaName}, Nanded` : "Nanded"), lat: r.latitude || 19.155, lng: r.longitude || 77.307,
          area: r.areaName, status: mapStatus(r.status), authorId: String(r.citizenId), authorName: r.citizenName || "Citizen",
          authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.citizenName || "U")}`, upvotes: r.upvotes || 0,
          downvotes: 0, upvotedCitizenIds: r.upvotedCitizenIds ? [...r.upvotedCitizenIds] : [], category: r.category, comments: [], messages: [],
          createdAt: r.createdAt || new Date().toISOString(), urgency: mapPriority(r.priority), coordinatorId: r.coordinatorId ? String(r.coordinatorId) : undefined,
        })));
      })
      .catch(console.error)
      .finally(() => setAdminReportsLoading(false));
  };

  const refreshApplications = () => {
    applicationService.getAll().then((data: any[]) => setApplications(data.map(a => ({
      id: String(a.id),
      // Backend now returns userId (not the full user object) after the @JsonIgnore fix
      userId: String(a.userId || ""),
      userName: a.userName || a.name || "",
      email: a.email || "", phone: a.phone || "", address: a.address || "", experience: a.experience || "",
      message: a.message || "", status: (a.status || "pending").toLowerCase() as "pending" | "approved" | "rejected",
      createdAt: a.createdAt || new Date().toISOString(),
    })))).catch(console.error);
  };

  const refreshSpamReports = () => {
    spamService.getAll().then((data: any[]) => setSpamReports(data.map(s => ({
      id: String(s.id), reporterId: String(s.reporterId || ""), reporterName: s.reporterName || "Anonymous",
      targetType: (s.targetType || "report").toLowerCase() as "user" | "report" | "comment", targetId: String(s.targetId || ""),
      reason: s.reason || "", status: (s.status || "pending").toLowerCase() as "pending" | "resolved",
      createdAt: s.createdAt || new Date().toISOString(),
    })))).catch(console.error);
  };

  const submitApplication = async (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => {
    try { await applicationService.submit({ name: app.userName, email: app.email, phone: app.phone, address: app.address, experience: app.experience, message: app.message }); toast.success("Application submitted!"); }
    catch { toast.error("Failed to submit application."); }
  };

  const updateApplicationStatus = async (id: string, status: "approved" | "rejected", areaId?: number) => {
    try { 
      await applicationService.updateStatus(id, status, areaId); 
      setApplications(prev => prev.filter(a => a.id !== id)); 
      if (status === "approved") {
        refreshUsers(); // Refresh the coordinator roster so the new coordinator appears
      }
      toast.success(`Application ${status}.`); 
    }
    catch { toast.error("Failed to update status."); }
  };

  const assignCoordinatorToReport = async (reportId: string, coordinatorId: string, refreshReports: () => void) => {
    try {
      // Uses complaintService (PATCH /api/complaints/{id}/assign) — NOT adminService
      // adminService does not define assignCoordinator; the endpoint lives in ComplaintController
      await complaintService.assignCoordinator(reportId, coordinatorId);
      toast.success("Coordinator assigned!");
      refreshReports();
    }
    catch { toast.error("Assignment failed."); }
  };

  const submitSpamReport = async (report: Omit<SpamReport, "id" | "status" | "createdAt">) => {
    try { await spamService.submit(report); toast.success("Report submitted for review."); }
    catch { toast.error("Submission failed."); }
  };

  const resolveSpamReport = async (id: string) => {
    try { await spamService.resolve(id); setSpamReports(prev => prev.filter(s => s.id !== id)); toast.success("Spam report resolved."); }
    catch { toast.error("Failed to resolve."); }
  };

  const banUser = async (id: string) => {
    try { await adminService.banUser(id); setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "banned" } : u)); toast.success("User banned."); }
    catch { toast.error("Failed to ban user."); }
  };

  const unbanUser = async (id: string) => {
    try { await adminService.unbanUser(id); setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "active" } : u)); toast.success("User unbanned."); }
    catch { toast.error("Failed to unban user."); }
  };

  const refreshAuditLogs = () => {
    setAuditLogsLoading(true);
    auditLogService.getAll()
      .then((data: any[]) => {
        setAuditLogs(data.map(a => ({
          id: String(a.id),
          action: a.action || "",
          entityType: a.entityType || "",
          entityId: String(a.entityId || ""),
          oldValue: a.oldValue || undefined,
          newValue: a.newValue || undefined,
          timestamp: a.timestamp || new Date().toISOString(),
          user: a.user ? { id: String(a.user.id), username: a.user.username || "System" } : undefined,
        })));
      })
      .catch(console.error)
      .finally(() => setAuditLogsLoading(false));
  };

  return (
    <AdminContext.Provider value={{ 
      users, usersLoading, usersPage, usersTotalPages, setUsersPage,
      adminReports, adminReportsLoading, adminReportsPage, adminReportsTotalPages, setAdminReportsPage, refreshAdminReports,
      applications, spamReports, refreshUsers, refreshApplications, refreshSpamReports, submitApplication, updateApplicationStatus, assignCoordinatorToReport, submitSpamReport, resolveSpamReport, banUser, unbanUser,
      auditLogs, auditLogsLoading, refreshAuditLogs,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => { const context = useContext(AdminContext); if (!context) throw new Error("useAdmin error"); return context; };
