import { createContext, useContext, ReactNode, useEffect } from "react";
export * from "./types";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ComplaintProvider, useComplaint } from "./contexts/ComplaintContext";
import { AdminProvider, useAdmin } from "./contexts/AdminContext";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext";

// Export the hook that combines all contexts to maintain backwards compatibility
// with existing components that call useAppContext()
export const useAppContext = () => {
  const auth = useAuth();
  const complaint = useComplaint();
  const admin = useAdmin();
  const notification = useNotification();

  // Combine all context values into a single God Object for legacy components
  return {
    ...auth,
    ...complaint,
    ...admin,
    ...notification
  };
};

// The new root provider that wraps the app with the specific domain providers
export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ComplaintProvider>
        <AdminProvider>
          <NotificationProvider>
            <DataFetcher>{children}</DataFetcher>
          </NotificationProvider>
        </AdminProvider>
      </ComplaintProvider>
    </AuthProvider>
  );
};

// A small component to handle the periodic refreshing of data based on auth state
const DataFetcher = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { refreshMasterData, refreshReports } = useComplaint();
  const { refreshUsers, refreshApplications, refreshSpamReports } = useAdmin();
  const { refreshNotifications } = useNotification();

  useEffect(() => {
    refreshMasterData();
    refreshReports();
    if (currentUser) {
      refreshNotifications();
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

  return <>{children}</>;
};