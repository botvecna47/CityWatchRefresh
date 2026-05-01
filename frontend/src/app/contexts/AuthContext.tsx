import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { User, Role } from "../types";
import { authService } from "../api/services";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserSettings: (settings: Partial<User["settings"]>) => void;
}

// AuthContext is kept internal — consumers use the useAuth() hook
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    authService.getMe()
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

  const updateUserSettings = (settings: Partial<User["settings"]>) => {
    if (!currentUser) return;
    const newSettings = { ...currentUser.settings, ...settings };
    setCurrentUser({ ...currentUser, settings: newSettings });
    if (settings.emailNotifications !== undefined) localStorage.setItem("settings_emailNotifs", JSON.stringify(settings.emailNotifications));
    if (settings.smsNotifications !== undefined) localStorage.setItem("settings_smsNotifs", JSON.stringify(settings.smsNotifications));
    if (settings.theme !== undefined) localStorage.setItem("settings_theme", settings.theme);
  };

  // Stabilize the context value so that consumers don't re-render
  // just because the provider re-renders (e.g. after a local state update)
  const value = useMemo(
    () => ({ currentUser, setCurrentUser, updateUserSettings }),
    // updateUserSettings closes over currentUser, so it changes when currentUser changes.
    // Including currentUser here is intentional and safe — it only triggers when the
    // user object *actually* changes (login/logout), not on every render.
    [currentUser] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
