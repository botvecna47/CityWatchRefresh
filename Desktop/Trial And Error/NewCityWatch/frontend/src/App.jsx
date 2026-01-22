import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOTPPage } from './pages/VerifyOTPPage';
import { IssuesPage } from './pages/IssuesPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import { useAuthStore } from './store/authStore';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if phone is verified (except for verify-otp page)
  if (user && !user.isPhoneVerified) {
    return <Navigate to="/verify-otp" state={{ phone: user.phone }} replace />;
  }

  // Check role if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Guest Route wrapper (redirect if logged in)
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    // If not verified, they should go to verify-otp, not dashboard
    // But dashboard redirect handles that? 
    // Wait, GuestRoute prevents access to login/register.
    // If they are auth but not verified, they shouldn't see login page either.
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Dashboard redirect based on role
function DashboardRedirect() {
  const { user } = useAuthStore();
  
  switch (user?.role) {
    case 'SUPER_ADMIN':
    case 'CITY_ADMIN':
      return <Navigate to="/admin" replace />;
    case 'MODERATOR':
      return <Navigate to="/moderation" replace />;
    default:
      return <Navigate to="/citizen" replace />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="issues/:id" element={<IssueDetailPage />} />
            
            {/* Guest only routes */}
            <Route 
              path="login" 
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              } 
            />
            <Route 
              path="register" 
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              } 
            />

            {/* OTP Verification */}
            <Route path="verify-otp" element={<VerifyOTPPage />} />
            
            {/* Dashboard redirect */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              } 
            />

            {/* Citizen routes */}
            <Route 
              path="citizen" 
              element={
                <ProtectedRoute>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="my-issues" 
              element={
                <ProtectedRoute>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="report" 
              element={
                <ProtectedRoute>
                  <ReportIssuePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Moderator routes */}
            <Route 
              path="moderation" 
              element={
                <ProtectedRoute allowedRoles={['MODERATOR', 'CITY_ADMIN', 'SUPER_ADMIN']}>
                  <ModeratorDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute allowedRoles={['CITY_ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/users" 
              element={
                <ProtectedRoute allowedRoles={['CITY_ADMIN', 'SUPER_ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="admin/*" 
              element={
                <ProtectedRoute allowedRoles={['CITY_ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="*" element={
              <div className="dashboard">
                <div className="dashboard-container">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              </div>
            } />
          </Route>
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
