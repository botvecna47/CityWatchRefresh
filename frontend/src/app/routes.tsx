import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "./components/Layout";
import { useAppContext } from "./store";
import { RouteErrorBoundary } from "./components/ErrorBoundary";

const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const SubmitReport = lazy(() => import("./pages/SubmitReport").then(m => ({ default: m.SubmitReport })));
const MapPage = lazy(() => import("./pages/MapPage").then(m => ({ default: m.MapPage })));
const Dashboard = lazy(() => import("./pages/Dashboards").then(m => ({ default: m.Dashboard })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
const AuthPage = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage").then(m => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ReportDetail = lazy(() => import("./pages/ReportDetail").then(m => ({ default: m.ReportDetail })));

function SuspenseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A4331]"></div>
      </div>
    }>
      {children}
    </Suspense>
  );
}


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext();
  if (!currentUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <SuspenseLayout><Home /></SuspenseLayout> },
      { path: "report/:id", element: <SuspenseLayout><ReportDetail /></SuspenseLayout> },
      { path: "map", element: <SuspenseLayout><MapPage /></SuspenseLayout> },
      { path: "auth", element: <SuspenseLayout><AuthPage /></SuspenseLayout> },
      { path: "submit", element: <ProtectedRoute><SuspenseLayout><SubmitReport /></SuspenseLayout></ProtectedRoute> },
      { path: "dashboard", element: <ProtectedRoute><SuspenseLayout><Dashboard /></SuspenseLayout></ProtectedRoute> },
      { path: "admin", element: <ProtectedRoute><SuspenseLayout><AdminPanel /></SuspenseLayout></ProtectedRoute> },
      { path: "notifications", element: <ProtectedRoute><SuspenseLayout><NotificationsPage /></SuspenseLayout></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><SuspenseLayout><SettingsPage /></SuspenseLayout></ProtectedRoute> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],

  },
]);
