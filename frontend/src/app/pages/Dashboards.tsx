import { useAppContext } from "../store";
import { Skeleton, Card } from "../components/ui";
import { CitizenDashboard } from "../components/dashboard/CitizenDashboard";
import { CoordinatorDashboard } from "../components/dashboard/CoordinatorDashboard";

export function Dashboard() {
  const { currentUser, reports, loading } = useAppContext();
  
  if (loading) return <DashboardSkeleton />;
  if (!currentUser) return <div className="p-8 text-center text-gray-500 font-serif min-h-[60vh] flex items-center justify-center">Please log in to view your dashboard.</div>;
  if (currentUser.role === "citizen") return <CitizenDashboard reports={reports.filter(r => r.authorId === currentUser.id)} />;
  if (currentUser.role === "coordinator") return <CoordinatorDashboard reports={reports} />;
  
  return <div className="p-8 text-center text-gray-500 font-serif">Admins use the Admin Panel.</div>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 bg-white shadow-sm">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-16" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mb-4 border-b pb-2" />
          {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mb-4 border-b pb-2" />
          {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    </div>
  );
}