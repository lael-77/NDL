import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import useAuthStore from "@/store/useAuthStore";

// Component to handle admin subdomain routing
const AdminSubdomainRoute = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check if we're on admin subdomain or admin path
    const hostname = window.location.hostname;
    // Support: admin.localhost, admin.ndl, admin.yourdomain.com, etc.
    const isAdminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.localhost';
    const isAdminPath = window.location.pathname.startsWith('/admin');

    // If on admin subdomain but not authenticated or not admin role, redirect to auth
    if (isAdminSubdomain || isAdminPath) {
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (user?.role?.toLowerCase() !== 'admin') {
        // Redirect non-admin users away from admin dashboard
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Only render admin dashboard if user is authenticated and is admin
  if (!isAuthenticated || user?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  return <AdminDashboard />;
};

export default AdminSubdomainRoute;

