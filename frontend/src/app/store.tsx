import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { api } from "./api";

export type Role = "citizen" | "coordinator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  area?: string;
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
  authorRole?: string;
  text: string;
  createdAt: string;
  parentId?: string;
}

export interface Report {
  id: string;
  title?: string;
  category: string;
  description: string;
  image?: string;
  imageUrl?: string;
  imageUrls: string[];
  locationText?: string;
  lat: number;
  lng: number;
  area?: string;
  areaName?: string;
  status: string;
  priority?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  upvotes: number;
  downvotes: number;
  coordinatorId?: string;
  coordinatorName?: string;
  comments: Comment[];
  createdAt: string;
  urgency?: string;
  slaDeadline?: string;
  closedAt?: string;
  intensityScore?: number;
  escalationLevel?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
  link?: string;
}

function mapBackendComplaint(c: any): Report {
  return {
    id: String(c.id),
    category: c.category || "",
    title: c.category ? (c.category.charAt(0) + c.category.slice(1).toLowerCase()) + " Issue" : "Complaint",
    description: c.description,
    image: c.imageUrls && c.imageUrls.length > 0 ? c.imageUrls[0] : "",
    imageUrl: c.imageUrls && c.imageUrls.length > 0 ? c.imageUrls[0] : "",
    imageUrls: c.imageUrls || [],
    locationText: c.locationText || `${c.latitude?.toFixed(4)}, ${c.longitude?.toFixed(4)}`,
    lat: c.latitude,
    lng: c.longitude,
    area: c.areaName,
    areaName: c.areaName,
    status: c.status,
    priority: c.priority,
    authorId: String(c.citizenId),
    authorName: c.citizenName,
    authorAvatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?w=150",
    upvotes: c.upvotes || 0,
    downvotes: c.downvotes || 0,
    coordinatorId: c.coordinatorId ? String(c.coordinatorId) : undefined,
    coordinatorName: c.coordinatorName,
    comments: [],
    createdAt: c.createdAt,
    urgency: c.priority,
    slaDeadline: c.slaDeadline,
    closedAt: c.closedAt,
    intensityScore: c.intensityScore,
    escalationLevel: c.escalationLevel,
  };
}

function mapBackendComment(c: any): Comment {
  return {
    id: String(c.id),
    authorId: String(c.authorId),
    authorName: c.authorName,
    authorRole: c.authorRole,
    text: c.content,
    createdAt: c.createdAt,
    parentId: c.parentId ? String(c.parentId) : undefined,
  };
}

function mapBackendNotification(n: any): Notification {
  return {
    id: String(n.id),
    title: n.title,
    message: n.message,
    read: n.isRead,
    type: n.type,
    createdAt: n.createdAt,
    link: n.link,
  };
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];

  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  loadReports: () => Promise<void>;
  addReport: (data: any) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => void;
  updateReportStatus: (id: string, status: string) => Promise<void>;

  handleVote: (reportId: string, type: "up" | "down") => void;
  addComment: (reportId: string, content: string) => Promise<void>;
  getComments: (reportId: string) => Promise<Comment[]>;

  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  banUser: (id: string) => Promise<void>;
  unbanUser: (id: string) => Promise<void>;
  loadAdminUsers: () => Promise<User[]>;
  updateUserSettings: (settings: Partial<User["settings"]>) => void;

  // Kept for SubmitReport UI state only
  applications: any[];
  spamReports: any[];
  submitApplication: (app: any) => void;
  submitSpamReport: (report: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [applications] = useState<any[]>([]);
  const [spamReports] = useState<any[]>([]);

  const mapToFrontendUser = (data: any): User => ({
    id: String(data.id),
    name: data.name || data.username,
    email: data.email,
    role: data.role?.toLowerCase() as Role,
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?w=150",
    area: data.areaName || data.area,
    status: (data.status || "ACTIVE").toLowerCase() === "active" ? "active" : "banned",
    settings: { emailNotifications: true, smsNotifications: false, theme: "system" },
  });

  const setCurrentUser = (user: User | null) => setCurrentUserState(user);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.auth.me()
      .then(data => setCurrentUserState(mapToFrontendUser(data)))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const data = await api.complaints.list();
      setReports(data.map(mapBackendComplaint));
    } catch {
      // silently fail — public page still renders
    }
  }, []);

  // Load reports on mount
  useEffect(() => { loadReports(); }, [loadReports]);

  // Load notifications when user is set
  useEffect(() => {
    if (currentUser) loadNotifications();
  }, [currentUser]);

  const addReport = async (data: any) => {
    const created = await api.complaints.submit(data);
    setReports(prev => [mapBackendComplaint(created), ...prev]);
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateReportStatus = async (id: string, status: string) => {
    const updated = await api.complaints.updateStatus(id, status);
    setReports(prev => prev.map(r => r.id === id ? mapBackendComplaint(updated) : r));
  };

  const handleVote = (reportId: string, type: "up" | "down") => {
    if (!currentUser) { toast.error("Please sign in to vote."); return; }
    // Optimistic UI — backend voting is coordinator-specific (VALID/INVALID)
    // Public upvote/downvote is a future feature; we update locally for now
    setReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return { ...r, upvotes: type === "up" ? r.upvotes + 1 : r.upvotes, downvotes: type === "down" ? r.downvotes + 1 : r.downvotes };
    }));
  };

  const getComments = async (reportId: string): Promise<Comment[]> => {
    const data = await api.comments.list(reportId);
    return data.map(mapBackendComment);
  };

  const addComment = async (reportId: string, content: string) => {
    await api.comments.add(reportId, content);
  };

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data.map(mapBackendNotification));
    } catch { }
  };

  const markNotificationRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    await api.notifications.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const banUser = async (id: string) => {
    await api.admin.banUser(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "banned" } : u));
    toast.success("User banned.");
  };

  const unbanUser = async (id: string) => {
    await api.admin.unbanUser(id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "active" } : u));
    toast.success("User unbanned.");
  };

  const loadAdminUsers = async (): Promise<User[]> => {
    const data = await api.admin.users();
    const mapped = data.map(mapToFrontendUser);
    setUsers(mapped);
    return mapped;
  };

  const updateUserSettings = (settings: Partial<User["settings"]>) => {
    if (currentUser) {
      const updated = { ...currentUser, settings: { ...currentUser.settings, ...settings } };
      setCurrentUserState(updated);
      toast.success("Settings updated.");
    }
  };

  const submitApplication = (app: any) => toast.success("Application submitted.");
  const submitSpamReport = (report: any) => toast.success("Report submitted to Admin.");

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, users,
      reports, setReports, loadReports, addReport, updateReport, updateReportStatus,
      handleVote, addComment, getComments,
      notifications, loadNotifications, markNotificationRead, markAllNotificationsRead,
      banUser, unbanUser, loadAdminUsers, updateUserSettings,
      applications, spamReports, submitApplication, submitSpamReport,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};