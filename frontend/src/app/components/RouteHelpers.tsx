import { Suspense } from "react";
import { Navigate } from "react-router";
import { useAppContext } from "../store";

export function SuspenseLayout({ children }: { children: React.ReactNode }) {
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

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthLoading } = useAppContext();

  // Still waiting for the backend to confirm the session — show a spinner, don't redirect
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A4331]"></div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
