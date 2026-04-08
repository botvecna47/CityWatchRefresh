import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format, subDays, subHours } from "date-fns";
import { toast } from "sonner";

export type Role = "citizen" | "coordinator" | "admin";
export type Status = "Reported" | "In Progress" | "Completed";
export type Area = "North Area" | "South Area" | "East Area" | "West Area";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  area?: Area; // for coordinators
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
  comments: Comment[];
  createdAt: string;
  urgency: "Low" | "Medium" | "High";
  coordinatorId?: string;
  proofImage?: string;
  resolutionLocation?: {lat: number, lng: number};
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
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshReports: () => void;
  addReport: (report: Partial<Report>) => Promise<void>;
  updateReport: (id: string, updates: Partial<Report>) => void;
  addComment: (reportId: string, comment: Comment) => void;
  handleVote: (id: string) => Promise<void>;
  
  // Advanced Settings / Management
  applications: CoordinatorApplication[];
  submitApplication: (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => void;
  updateApplicationStatus: (id: string, status: "approved" | "rejected") => void;

  spamReports: SpamReport[];
  submitSpamReport: (report: Omit<SpamReport, "id" | "status" | "createdAt">) => void;
  resolveSpamReport: (id: string) => void;

  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;

  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  updateUserSettings: (settings: Partial<User["settings"]>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState<CoordinatorApplication[]>([]);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // On mount, check for stored JWT and restore session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token invalid");
          return res.json();
        })
        .then((data) => {
          setCurrentUser({
            id: String(data.id),
            name: data.name || data.username,
            email: data.email,
            role: data.role.toLowerCase() as "citizen" | "coordinator" | "admin",
            avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?w=150",
            area: data.area || undefined,
            status: (data.status || "ACTIVE").toLowerCase() as "active" | "banned",
            settings: {
              emailNotifications: true,
              smsNotifications: false,
              theme: "system",
            },
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  const refreshReports = () => {
    setLoading(true);
    fetch("/api/complaints")
      .then(res => res.json())
      .then((data: any[]) => {
        const mappedReports: Report[] = data.map(r => ({
          id: String(r.id),
          title: r.category + " Issue",
          description: r.description,
          image: r.imageUrls && r.imageUrls.length > 0 ? r.imageUrls[0] : "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600",
          locationText: r.locationText || "Springfield",
          lat: r.latitude,
          lng: r.longitude,
          area: r.areaName as Area,
          status: mapStatus(r.status),
          authorId: String(r.citizenId),
          authorName: r.citizenName,
          authorAvatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?w=150",
          upvotes: r.upvotes,
          downvotes: r.downvotes,
          comments: [], 
          createdAt: r.createdAt,
          urgency: mapPriority(r.priority),
          coordinatorId: r.coordinatorId ? String(r.coordinatorId) : undefined
        }));
        setReports(mappedReports);
      })
      .catch(err => console.error("Failed to fetch reports:", err))
      .finally(() => setLoading(false));
  };

  const mapStatus = (s: string): Status => {
    switch (s) {
      case "IN_PROGRESS": return "In Progress";
      case "COMPLETED": return "Completed";
      default: return "Reported";
    }
  };

  const mapPriority = (p: string): "Low" | "Medium" | "High" => {
    switch (p) {
      case "HIGH": return "High";
      case "MEDIUM": return "Medium";
      default: return "Low";
    }
  };

  useEffect(() => {
    refreshReports();
  }, [currentUser]);

  const addReport = async (reportReq: Partial<Report>) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          category: reportReq.title?.split(' ')[0].toUpperCase() || "OTHER",
          description: reportReq.description,
          imageUrls: reportReq.image ? [reportReq.image] : [],
          latitude: reportReq.lat,
          longitude: reportReq.lng,
          locationText: reportReq.locationText
        })
      });
      if (res.ok) {
        refreshReports();
        toast.success("Report submitted successfully!");
      }
    } catch (err) {
      toast.error("Failed to submit report.");
    }
  };

  const handleVote = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`/api/complaints/${id}/upvote`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) refreshReports();
    } catch (err) {
      console.error("Vote failed");
    }
  };

  

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  };

  const addComment = (reportId: string, comment: Comment) => {
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, comments: [...r.comments, comment] } : r));
  };

  const submitApplication = (app: Omit<CoordinatorApplication, "id" | "status" | "createdAt">) => {
    const newApp: CoordinatorApplication = {
      ...app,
      id: "app_" + Date.now(),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    setApplications(prev => [newApp, ...prev]);
    toast.success("Application submitted successfully!");
    
    // Notify Admin
    addNotification({
      userId: "u3", // Assuming u3 is the admin for demo
      title: "New Coordinator Application",
      message: `${app.userName} applied to be a coordinator.`,
      type: "application",
      link: "/admin"
    });
  };


  const updateApplicationStatus = (id: string, status: "approved" | "rejected") => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    
    const app = applications.find(a => a.id === id);
    if (app && status === "approved") {
      // Make the user a coordinator
      setUsers(prev => prev.map(u => u.id === app.userId ? { ...u, role: "coordinator", area: "North Area" } : u));
      if (currentUser?.id === app.userId) {
        setCurrentUser(prev => prev ? { ...prev, role: "coordinator", area: "North Area" } : null);
      }
      
      addNotification({
        userId: app.userId,
        title: "Application Approved",
        message: "Your application to become a coordinator has been approved.",
        type: "system",
        link: "/dashboard"
      });
    }
    toast.success(`Application ${status}`);
  };

  const submitSpamReport = (report: Omit<SpamReport, "id" | "status" | "createdAt">) => {
    const newReport: SpamReport = {
      ...report,
      id: "spam_" + Date.now(),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    setSpamReports(prev => [newReport, ...prev]);
    toast.success("Report submitted to Admin.");
  };

  const resolveSpamReport = (id: string) => {
    setSpamReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    toast.success("Spam report resolved.");
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    if (currentUser) {
      setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotif: Notification = {
      ...notification,
      id: "notif_" + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const banUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "banned" } : u));
    toast.success("User banned.");
  };

  const unbanUser = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "active" } : u));
    toast.success("User unbanned.");
  };

  const updateUserSettings = (settings: Partial<User["settings"]>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, settings: { ...currentUser.settings, ...settings } };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      toast.success("Settings updated successfully.");
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, users, setUsers, reports, setReports, loading, setLoading, refreshReports, addReport, updateReport, addComment, handleVote,
      applications, submitApplication, updateApplicationStatus,
      spamReports, submitSpamReport, resolveSpamReport,
      notifications, markNotificationRead, markAllNotificationsRead, addNotification,
      banUser, unbanUser, updateUserSettings
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