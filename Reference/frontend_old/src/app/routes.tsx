import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ReportDetail } from "./pages/ReportDetail";
import { SubmitReport } from "./pages/SubmitReport";
import { MapPage } from "./pages/MapPage";
import { Dashboard } from "./pages/Dashboards";
import { AdminPanel } from "./pages/AdminPanel";
import { useAppContext } from "./store";
import { AuthPage } from "./pages/AuthPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext();
  if (!currentUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "report/:id", element: <ReportDetail /> },
      { path: "map", element: <MapPage /> },
      { path: "auth", element: <AuthPage /> },
      { path: "submit", element: <ProtectedRoute><SubmitReport /></ProtectedRoute> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "admin", element: <ProtectedRoute><AdminPanel /></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute><NotificationsPage /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
