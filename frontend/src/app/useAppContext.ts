// This file intentionally contains ONLY the hook export so that
// Vite Fast Refresh can work correctly (no mixing of hooks and components).
import { useAuth } from "./contexts/AuthContext";
import { useComplaint } from "./contexts/ComplaintContext";
import { useAdmin } from "./contexts/AdminContext";
import { useNotification } from "./contexts/NotificationContext";

export const useAppContext = () => {
  const auth = useAuth();
  const complaint = useComplaint();
  const admin = useAdmin();
  const notification = useNotification();

  // Combine all context values into a single object for backwards compatibility
  // with existing components that call useAppContext()
  return {
    ...auth,
    ...complaint,
    ...admin,
    ...notification,
  };
};
