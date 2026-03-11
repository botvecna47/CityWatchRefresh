import CitizenDashboard from "../citizen/CitizenDashboard";
import CoordinatorDashboard from "../coordinator/CoordinatorDashboard";
import AdminPanel from "../admin/AdminDashboard";

const DashboardPage = () => {
  // TODO: Replace with actual auth context hook (e.g., const { role } = useAuth())
  const userRole = "CITIZEN"; // Options: "CITIZEN", "COORDINATOR", "ADMIN"

  return (
    <div className="container mx-auto px-4 pt-6">
      {userRole === "CITIZEN" && <CitizenDashboard />}
      {userRole === "COORDINATOR" && <CoordinatorDashboard />}
      {userRole === "ADMIN" && <AdminPanel />}
    </div>
  );
};

export default DashboardPage;
