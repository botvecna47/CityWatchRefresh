import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type Role = "citizen" | "coordinator" | "admin";
export type Status = "Reported" | "In Progress" | "Completed";
export type Area = string;

export interface AreaEntity {
  id: number;
  name: string;
  city: string;
  centerLat: number;
  centerLng: number;
  boundaryLatMin?: number;
  boundaryLatMax?: number;
  boundaryLngMin?: number;
  boundaryLngMax?: number;
}

export interface CategoryEntity {
  id: number;
  name: string;
  description: string;
  defaultSlaHours: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  area?: Area;
  status: "active" | "banned";
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    theme: "light" | "dark" | "system";
  };
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  image: string;
  locationText: string;
  lat: number;
  lng: number;
  area: Area;
  status: Status;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  upvotes: number;
  downvotes: number;
  upvotedCitizenIds?: string[];
  category?: string;
  comments: Comment[];
  createdAt: string;
  urgency: "Low" | "Medium" | "High";
  coordinatorId?: string;
  proofImage?: string;
  resolutionLocation?: { lat: number; lng: number };
  additionalImages?: string[];
}

export interface CoordinatorApplication {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SpamReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: "user" | "report" | "comment";
  targetId: string;
  reason: string;
  status: "pending" | "resolved";
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "system" | "report" | "application";
  createdAt: string;
  link?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  areas: AreaEntity[];
  setAreas: React.Dispatch<React.SetStateAction<AreaEntity[]>>;
  categories: CategoryEntity[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryEntity[]>>;
  refreshMasterData: () => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshReports: () => void;
  refreshUsers: () => void;
  addReport: (report: Partial<Report>) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => Promise<void>;
  addComment: (reportId: string, comment: Comment) => void;
  handleVote: (id: string) => Promise<void>;
  submitProof: (id: string, imageUrl: string, lat: number, lng: number) => Promise<void>;
  refreshApplications: () => void;
  refreshSpamReports: () => void;
  applications: CoordinatorApplication[];
  submitApplication: (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => void;
  updateApplicationStatus: (id: string, status: "approved" | "rejected", areaId?: number) => void;
  assignCoordinatorToReport: (reportId: string, coordinatorId: string) => Promise<void>;
  spamReports: SpamReport[];
  submitSpamReport: (report: Omit<SpamReport, "id" | "status" | "createdAt">) => void;
  resolveSpamReport: (id: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  updateUserSettings: (settings: Partial<User["settings"]>) => void;
  deleteReport: (id: string, spamReportId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Maps every backend ComplaintStatus value to a frontend display status
const mapStatus = (s: string): Status => {
  switch ((s || "").toUpperCase()) {
    case "IN_PROGRESS":
    case "ASSIGNED":
      return "In Progress";
    case "COMPLETED":
    case "CLOSED":
      return "Completed";
    case "PENDING_REVIEW":
    case "APPROVED":
    case "DRAFT":
    case "REOPENED":
    case "DELAYED":
    case "ESCALATED":
    default:
      return "Reported";
  }
};

// Maps a frontend status to the backend enum value for PATCH calls
const toBackendStatus = (s: Status): string => {
  switch (s) {
    case "In Progress": return "IN_PROGRESS";
    case "Completed":   return "COMPLETED";
    default:            return "PENDING_REVIEW";
  }
};

const mapPriority = (p: string): "Low" | "Medium" | "High" => {
  switch ((p || "").toUpperCase()) {
    case "HIGH":   return "High";
    case "MEDIUM": return "Medium";
    default:       return "Low";
  }
};

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [areas, setAreas] = useState<AreaEntity[]>([]);
  const [categories, setCategories] = useState<CategoryEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [applications, setApplications] = useState<CoordinatorApplication[]>([]);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Restore JWT session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error("invalid"); return res.json(); })
      .then(data => {
        setCurrentUser({
          id: String(data.id),
          name: data.name || data.username,
          email: data.email,
          role: (data.role || "citizen").toLowerCase() as Role,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.username || data.email)}`,
          area: data.areaName || data.area || undefined,
          status: (data.status || "ACTIVE").toLowerCase() as "active" | "banned",
          settings: {
            emailNotifications: JSON.parse(localStorage.getItem("settings_emailNotifs") ?? "true"),
            smsNotifications: JSON.parse(localStorage.getItem("settings_smsNotifs") ?? "false"),
            theme: (localStorage.getItem("settings_theme") as "light" | "dark" | "system") || "light",
          },
        });
      })
      .catch(() => localStorage.removeItem("token"));
  }, []);

  const refreshReports = () => {
    setLoading(true);
    fetch("/api/complaints")
      .then(res => res.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const mapped: Report[] = data.map(r => ({
          id: String(r.id),
          title: r.title || (r.category ? r.category.replace(/_/g, " ") : "Reported Issue"),
          description: r.description || "",
          image: r.imageUrls?.length > 0 ? r.imageUrls[0] : "",
          additionalImages: r.imageUrls?.slice(1) || [],
          locationText: r.locationText || (r.areaName ? `${r.areaName}, Nanded` : "Nanded"),
          lat: r.latitude || 19.155,
          lng: r.longitude || 77.307,
          area: r.areaName as Area,
          status: mapStatus(r.status),
          authorId: String(r.citizenId),
          authorName: r.citizenName || "Citizen",
          authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.citizenName || "U")}`,
          upvotes: r.upvotes || 0,
          downvotes: 0,
          upvotedCitizenIds: r.upvotedCitizenIds ? [...r.upvotedCitizenIds] : [],
          category: r.category,
          comments: [],  // populated below
          createdAt: r.createdAt || new Date().toISOString(),
          urgency: mapPriority(r.priority),
          coordinatorId: r.coordinatorId ? String(r.coordinatorId) : undefined,
        }));

        // Bug 9 fix: fetch comments for every report in parallel
        Promise.all(
          mapped.map(report =>
            fetch(`/api/complaints/${report.id}/comments`)
              .then(res => res.ok ? res.json() : [])
              .then((comments: any[]) => ({
                ...report,
                comments: Array.isArray(comments) ? comments.map((c: any) => ({
                  id: String(c.id),
                  authorId: String(c.authorId || ""),
                  authorName: c.authorName || "Unknown",
                  text: c.content || "",
                  createdAt: c.createdAt || new Date().toISOString(),
                })) : [],
              }))
              .catch(() => report)
          )
        ).then(reportsWithComments => setReports(reportsWithComments));
      })
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  };

  const refreshUsers = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: any[]) => setUsers(data.map(u => ({
        id: String(u.id),
        name: u.username || "Unknown",
        email: u.email,
        role: (u.role || "citizen").toLowerCase() as Role,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.username || u.email)}`,
        // Bug 8 fix: SUSPENDED maps to "banned" since UserStatus enum has no BANNED value
        status: (u.status || "ACTIVE").toUpperCase() === "ACTIVE" ? "active" : "banned" as "active" | "banned",
        area: u.areaName || undefined,
        settings: { emailNotifications: true, smsNotifications: false, theme: "system" as const }
      }))))
      .catch(console.error);
  };

  const refreshApplications = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/applications", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: any[]) => setApplications(data.map(a => ({
        id: String(a.id),
        userId: String(a.userId || a.user?.id || ""),
        userName: a.userName || a.name || "",
        email: a.email || "",
        phone: a.phone || "",
        address: a.address || "",
        experience: a.experience || "",
        message: a.message || "",
        status: (a.status || "pending").toLowerCase() as "pending" | "approved" | "rejected",
        createdAt: a.createdAt || new Date().toISOString(),
      }))))
      .catch(console.error);
  };

  const refreshSpamReports = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/spam-reports", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: any[]) => setSpamReports(data.map(s => ({
        id: String(s.id),
        reporterId: String(s.reporterId || ""),
        reporterName: s.reporterName || "Anonymous",
        targetType: (s.targetType || "report").toLowerCase() as "user" | "report" | "comment",
        targetId: String(s.targetId || ""),
        reason: s.reason || "",
        status: (s.status || "pending").toLowerCase() as "pending" | "resolved",
        createdAt: s.createdAt || new Date().toISOString(),
      }))))
      .catch(console.error);
  };

  const refreshMasterData = async () => {
    try {
      const [areasRes, categoriesRes] = await Promise.all([
        fetch("/api/areas"),
        fetch("/api/categories")
      ]);
      if (areasRes.ok) setAreas(await areasRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Failed to fetch master data:", error);
    }
  };

  // Bug 3 fix: fetch notifications from the backend
  const refreshNotifications = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: any[]) => {
        setNotifications(data.map(n => ({
          id: String(n.id),
          userId: "",  // not returned by backend, filled from currentUser
          title: n.title || "",
          message: n.message || "",
          read: Boolean(n.isRead || n.read),
          type: (n.type || "system").toLowerCase() as "system" | "report" | "application",
          createdAt: n.createdAt || new Date().toISOString(),
          link: n.link || undefined,
        })));
      })
      .catch(console.error);
  };

  useEffect(() => {
    refreshMasterData();
    refreshReports();
    if (currentUser) {
      refreshNotifications();  // Bug 3 fix: fetch notifications when user is known
      if (currentUser.role === "admin") {
        refreshUsers();
        refreshApplications();
        refreshSpamReports();
      }
    }
    const interval = setInterval(() => {
      refreshReports();
      if (currentUser) {
        refreshNotifications();
        if (currentUser.role === "admin") {
          refreshApplications();
          refreshSpamReports();
        }
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const addReport = async (reportReq: Partial<Report>) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please sign in to report."); return; }
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          category: reportReq.category || "OTHER",
          title: reportReq.title || "Reported Issue",
          description: reportReq.description,
          imageUrls: [reportReq.image, ...(reportReq.additionalImages || [])].filter(Boolean),
          latitude: reportReq.lat,
          longitude: reportReq.lng,
          locationText: reportReq.locationText,
          areaName: reportReq.area,
        }),
      });
      if (res.ok) {
        refreshReports();
        toast.success("Complaint submitted successfully!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || `Submission failed (${res.status})`);
      }
    } catch {
      toast.error("Network error — could not submit complaint.");
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    // Optimistic local update first
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    const token = localStorage.getItem("token");
    if (!token || !updates.status) return;
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: toBackendStatus(updates.status) }),
      });
      if (res.ok) {
        refreshReports();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || `Update failed (${res.status})`);
        refreshReports(); // Revert to server state
      }
    } catch {
      toast.error("Network error updating status.");
      refreshReports();
    }
  };

  const submitProof = async (id: string, imageUrl: string, lat: number, lng: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/complaints/${id}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ imageUrl, latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        toast.success("Resolution proof submitted! Citizen will be notified.");
        refreshReports();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || `Proof submission failed (${res.status})`);
      }
    } catch {
      toast.error("Network error submitting proof.");
    }
  };

  const handleVote = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Sign in to upvote."); return; }
    // Optimistic toggle
    let wasUpvoted = false;
    if (currentUser) {
      setReports(prev => prev.map(r => {
        if (r.id !== id) return r;
        const ids = r.upvotedCitizenIds || [];
        wasUpvoted = ids.includes(currentUser.id);
        return {
          ...r,
          upvotes: wasUpvoted ? r.upvotes - 1 : r.upvotes + 1,
          upvotedCitizenIds: wasUpvoted
            ? ids.filter(i => i !== currentUser.id)
            : [...ids, currentUser.id],
        };
      }));
    }
    try {
      const res = await fetch(`/api/complaints/${id}/upvote`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        if (wasUpvoted) {
          toast.info("Upvote removed.");
        } else {
          toast.success("Upvoted! Thank you for your support.");
        }
      } else {
        refreshReports(); // Revert on error
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Vote failed");
      }
    } catch {
      refreshReports();
      toast.error("Network error voting.");
    }
  };

  const deleteReport = async (id: string, spamReportId?: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        if (spamReportId) resolveSpamReport(spamReportId);
        toast.success("Report deleted.");
      } else toast.error("Failed to delete report.");
    } catch { toast.error("Network error."); }
  };

  const addComment = async (reportId: string, comment: Comment) => {
    // Optimistic
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, comments: [...r.comments, comment] } : r));
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`/api/complaints/${reportId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ content: comment.text }),  // backend expects 'content' not 'text'
    }).then(res => {
      if (res.ok) res.json().then(saved => {
        // Replace optimistic comment with real one from server
        setReports(prev => prev.map(r => {
          if (r.id !== reportId) return r;
          const comments = r.comments.filter(c => c.id !== comment.id);
          return { ...r, comments: [...comments, {
            id: String(saved.id),
            authorId: String(saved.authorId || ""),
            authorName: saved.authorName || comment.authorName,
            text: saved.content || comment.text,
            createdAt: saved.createdAt || comment.createdAt,
          }]};
        }));
      });
    }).catch(() => {});
  };

  const submitApplication = async (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ name: app.userName, email: app.email, phone: app.phone, address: app.address, experience: app.experience, message: app.message }),
    }).catch(() => null);
    if (res?.ok) toast.success("Application submitted!");
    else toast.error("Failed to submit application.");
  };

  const updateApplicationStatus = async (id: string, status: "approved" | "rejected", areaId?: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    let url = `/api/applications/${id}/status?status=${status.toUpperCase()}`;
    if (areaId) url += `&areaId=${areaId}`;
    
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` },
    }).catch(() => null);
    if (res?.ok) {
      setApplications(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
      toast.success(`Application ${status}`);
    }
  };

  const assignCoordinatorToReport = async (reportId: string, coordinatorId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/complaints/${reportId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ coordinatorId }),
      });
      if (res.ok) {
        toast.success("Coordinator assigned manually.");
        refreshReports();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to assign coordinator");
      }
    } catch {
      toast.error("Network error during assignment.");
    }
  };

  const submitSpamReport = async (report: Omit<SpamReport, "id" | "status" | "createdAt">) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/spam-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ targetType: report.targetType, targetId: report.targetId, reason: report.reason }),
    }).catch(() => null);
    if (res?.ok) toast.success("Flagged for admin review.");
    else toast.error("Failed to submit spam report.");
  };

  const resolveSpamReport = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`/api/spam-reports/${id}/status?status=RESOLVED`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` },
    }).catch(() => null);
    if (res?.ok) setSpamReports(prev => prev.map(r => (r.id === id ? { ...r, status: "resolved" } : r)));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    const token = localStorage.getItem("token");
    if (token) fetch(`/api/notifications/${id}/read`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    if (currentUser) setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const token = localStorage.getItem("token");
    if (token) fetch("/api/notifications/read-all", { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }).catch(() => {});
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    setNotifications(prev => [
      { ...notification, id: "notif_" + Date.now(), read: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const banUser = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`/api/admin/users/${id}/ban`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }).catch(() => null);
    if (res?.ok) { setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: "banned" } : u))); toast.success("User banned."); }
    else toast.error("Failed to ban user.");
  };

  const unbanUser = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`/api/admin/users/${id}/unban`, { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }).catch(() => null);
    if (res?.ok) { setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: "active" } : u))); toast.success("User unbanned."); }
    else toast.error("Failed to unban user.");
  };

  const updateUserSettings = async (settings: Partial<User["settings"]>) => {
    if (!currentUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const updated = { ...currentUser, settings: { ...currentUser.settings, ...settings } };
    setCurrentUser(updated);
    const m = updated.settings;
    localStorage.setItem("settings_theme", m.theme);
    localStorage.setItem("settings_emailNotifs", String(m.emailNotifications));
    localStorage.setItem("settings_smsNotifs", String(m.smsNotifications));
    const res = await fetch("/api/settings/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ emailNotifications: settings.emailNotifications, smsNotifications: settings.smsNotifications, theme: settings.theme }),
    }).catch(() => null);
    if (res?.ok) toast.success("Settings saved.");
    else toast.error("Settings sync failed — changes kept locally.");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser, users, setUsers, reports, setReports,
        areas, setAreas, categories, setCategories, refreshMasterData,
        loading, setLoading, refreshReports, refreshUsers,
        addReport, updateReport, addComment, handleVote, submitProof,
        refreshApplications, refreshSpamReports,
        applications, submitApplication, updateApplicationStatus, assignCoordinatorToReport,
        spamReports, submitSpamReport, resolveSpamReport,
        notifications, markNotificationRead, markAllNotificationsRead, addNotification,
        selectedReportId, setSelectedReportId,
        banUser, unbanUser, updateUserSettings, deleteReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};