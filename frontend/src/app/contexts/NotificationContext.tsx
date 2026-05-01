import { createContext, useContext, useState, ReactNode } from "react";
import { Notification } from "../types";
import { notificationService } from "../api/services";

interface NotificationContextType {
  notifications: Notification[];
  refreshNotifications: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
}

// NotificationContext is kept internal — consumers use the useNotification() hook
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = () => {
    notificationService.getAll()
      .then((data: any[]) => {
        setNotifications(data.map(n => ({
          id: String(n.id), userId: "", title: n.title || "", message: n.message || "",
          read: Boolean(n.isRead || n.read), type: (n.type || "system").toLowerCase() as "system" | "report" | "application",
          createdAt: n.createdAt || new Date().toISOString(), link: n.link || undefined,
        })));
      }).catch(console.error);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    notificationService.markRead(id).catch(() => refreshNotifications());
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notificationService.markAllRead().catch(() => refreshNotifications());
  };

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    setNotifications(prev => [{ ...notification, id: Math.random().toString(), createdAt: new Date().toISOString(), read: false }, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, refreshNotifications, markNotificationRead, markAllNotificationsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => { const context = useContext(NotificationContext); if (!context) throw new Error("useNotification error"); return context; };
