import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { User, Role } from "../types";
import { authService } from "../api/services";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserSettings: (settings: Partial<User["settings"]>) => void;
  isAuthLoading: boolean;
}

// AuthContext is kept internal — consumers use the useAuth() hook
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthLoading(false);
      return;
    }
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
      .catch((err) => {
        // Only wipe the token on a real 401 Unauthorized — NOT on network errors
        // (i.e. when the backend is simply down/unreachable)
        const message = err?.message || "";
        if (message.includes("401")) {
          localStorage.removeItem("token");
        }
        // If backend is unreachable, keep the token so the user stays "logged in"
        // and can retry once the server comes back up
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  const updateUserSettings = (settings: Partial<User["settings"]>) => {
    if (!currentUser) return;
    const newSettings = { ...currentUser.settings, ...settings };
    setCurrentUser({ ...currentUser, settings: newSettings });
    // Persist to localStorage for instant reads
    if (settings.emailNotifications !== undefined) localStorage.setItem("settings_emailNotifs", JSON.stringify(settings.emailNotifications));
    if (settings.smsNotifications !== undefined) localStorage.setItem("settings_smsNotifs", JSON.stringify(settings.smsNotifications));
    if (settings.theme !== undefined) localStorage.setItem("settings_theme", settings.theme);
    // Persist to backend DB
    authService.updateSettings({
      emailNotifications: newSettings.emailNotifications,
      smsNotifications: newSettings.smsNotifications,
      theme: newSettings.theme,
    }).catch(err => console.warn("[AuthContext] Failed to save settings to backend:", err));
  };

  // Stabilize the context value so that consumers don't re-render
  // just because the provider re-renders (e.g. after a local state update)
  const value = useMemo(
    () => ({ currentUser, setCurrentUser, updateUserSettings, isAuthLoading }),
    // updateUserSettings closes over currentUser, so it changes when currentUser changes.
    // Including currentUser here is intentional and safe — it only triggers when the
    // user object *actually* changes (login/logout), not on every render.
    [currentUser, isAuthLoading] // eslint-disable-line react-hooks/exhaustive-deps
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
