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
  userVotes?: Record<string, "up" | "down">;
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

const mockUsers: User[] = [
  { 
    id: "u1", 
    name: "Alice Citizen", 
    email: "alice@example.com", 
    role: "citizen", 
    status: "active", 
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150",
    settings: { emailNotifications: true, smsNotifications: false, theme: "system" }
  },
  { 
    id: "u2", 
    name: "Bob Coordinator", 
    email: "bob@citywatch.com", 
    role: "coordinator", 
    status: "active", 
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150", 
    area: "North Area",
    settings: { emailNotifications: true, smsNotifications: true, theme: "light" }
  },
  { 
    id: "u3", 
    name: "Carol Admin", 
    email: "admin@citywatch.com", 
    role: "admin", 
    status: "active", 
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150",
    settings: { emailNotifications: true, smsNotifications: false, theme: "system" }
  },
  { 
    id: "u4", 
    name: "Dave Coordinator", 
    email: "dave@citywatch.com", 
    role: "coordinator", 
    status: "active", 
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150", 
    area: "South Area",
    settings: { emailNotifications: true, smsNotifications: false, theme: "system" }
  },
];

const mockReports: Report[] = [
  {
    id: "r1",
    title: "Large Pothole on Main St",
    description: "There is a massive pothole causing damage to cars near the central intersection. It has been there for weeks and keeps getting larger after the recent rain.",
    image: "https://images.unsplash.com/photo-1667317980667-9d5ed99f829e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc3RyZWV0JTIwcG90aG9sZSUyMGRhbWFnZXxlbnwxfHx8fDE3NzMyMjUwMDN8MA&ixlib=rb-4.1.0&q=80&w=600",
    locationText: "123 Main St",
    lat: 40.7128,
    lng: -74.0060,
    area: "North Area",
    status: "In Progress",
    authorId: "u1",
    authorName: "Alice Citizen",
    authorAvatar: mockUsers[0].avatar,
    upvotes: 145,
    downvotes: 2,
    comments: [
      { id: "c1", authorId: "u2", authorName: "Bob Coordinator", text: "We have dispatched a team to look into this today.", createdAt: format(subHours(new Date(), 5), "yyyy-MM-dd'T'HH:mm:ss'Z'") },
      { id: "c2", authorId: "u1", authorName: "Alice Citizen", text: "Thank you! It's very dangerous at night.", createdAt: format(subHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss'Z'") }
    ],
    createdAt: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    urgency: "High",
    coordinatorId: "u2"
  },
  {
    id: "r2",
    title: "Overgrown Trees Blocking Streetlight",
    description: "The branches have completely covered the streetlight on Oak avenue, making the sidewalk pitch black at night.",
    image: "https://images.unsplash.com/photo-1765300012968-2c4ceb1d99c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwb3Zlcmdyb3duJTIwdHJlZXMlMjBzdHJlZXR8ZW58MXx8fHwxNzczMzI1ODc5fDA&ixlib=rb-4.1.0&q=80&w=600",
    locationText: "45 Oak Avenue",
    lat: 40.7150,
    lng: -74.0100,
    area: "South Area",
    status: "Reported",
    authorId: "u1",
    authorName: "Alice Citizen",
    authorAvatar: mockUsers[0].avatar,
    upvotes: 89,
    downvotes: 0,
    comments: [],
    createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    urgency: "Medium"
  }
];

const mockNotifications: Notification[] = [
  { id: "n1", userId: "u1", title: "Report Status Updated", message: "Your report 'Large Pothole on Main St' is now In Progress.", read: false, type: "report", createdAt: format(subHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"), link: "/report/r1" },
  { id: "n2", userId: "u3", title: "New Coordinator Application", message: "A user wants to join the coordinator team.", read: false, type: "application", createdAt: format(subHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"), link: "/admin" },
];

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  handleVote: (reportId: string, type: "up" | "down") => void;
  addComment: (reportId: string, comment: Comment) => void;
  
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
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(mockReports);

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
            avatar:
              "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150",
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
  
  const [applications, setApplications] = useState<CoordinatorApplication[]>([
    { id: "app1", userId: "u1", userName: "Alice Citizen", email: "alice@example.com", address: "123 Main St", experience: "Volunteered at local shelter for 2 years", phone: "555-0199", message: "I want to help the community.", status: "pending", createdAt: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'") }
  ]);
  const [spamReports, setSpamReports] = useState<SpamReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  };

  const addComment = (reportId: string, comment: Comment) => {
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, comments: [...r.comments, comment] } : r));
  };

  const handleVote = (reportId: string, type: "up" | "down") => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setReports((prev) => prev.map((report) => {
      if (report.id !== reportId) return report;
      
      const currentVotes = report.userVotes || {};
      const previousVote = currentVotes[userId];
      
      let newUpvotes = report.upvotes;
      let newDownvotes = report.downvotes;
      const newUserVotes = { ...currentVotes };

      if (previousVote === type) {
        // Toggle off
        if (type === "up") newUpvotes--;
        else newDownvotes--;
        delete newUserVotes[userId];
      } else {
        // Switch or new vote
        if (previousVote === "up") newUpvotes--;
        if (previousVote === "down") newDownvotes--;
        
        if (type === "up") newUpvotes++;
        if (type === "down") newDownvotes++;
        newUserVotes[userId] = type;
      }

      return {
        ...report,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVotes: newUserVotes
      };
    }));
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
      currentUser, setCurrentUser, users, setUsers, reports, setReports, addReport, updateReport, handleVote, addComment,
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