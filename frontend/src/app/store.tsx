import { ReactNode, useEffect } from "react";
export * from "./types";
export { useAppContext } from "./useAppContext"; // re-exported for backwards compat

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ComplaintProvider, useComplaint } from "./contexts/ComplaintContext";
import { AdminProvider, useAdmin } from "./contexts/AdminContext";
import { NotificationProvider, useNotification } from "./contexts/NotificationContext";

// The new root provider that wraps the app with the specific domain providers
export function AppProvider({ children }: { children: ReactNode }) {
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
}

// A small component to handle the periodic refreshing of data based on auth state
function DataFetcher({ children }: { children: ReactNode }) {
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
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}