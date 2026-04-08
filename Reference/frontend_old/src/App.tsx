import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import HomePage from "./pages/public/LandingPage";
import ReportsPage from "./pages/shared/ReportsPage";
import ReportDetailPage from "./pages/shared/ComplaintDetail";
import ReportMapPage from "./pages/shared/MapPage";
import SubmitReportPage from "./pages/citizen/SubmitReportPage";
import DashboardPage from "./pages/shared/DashboardPage";
import AdminPanel from "./pages/admin/AdminDashboard";
import SettingsPage from "./pages/shared/SettingsPage";
import NotFound from "./pages/shared/NotFoundPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/map" element={<ReportMapPage />} />
          <Route path="/submit" element={<SubmitReportPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
