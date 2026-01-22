import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, FileText, Shield, Settings, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ChevronRight,
  Activity, BarChart3, MapPin, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/admin.service';
import { Button } from '../components/common/Button';
import './Dashboard.css';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingModeration: 0,
    resolvedThisMonth: 0,
    activeCategories: 0,
    citiesActive: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, trendsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getActivity(),
        adminService.getTrends()
      ]);

      setStats(statsRes.data || {});
      setRecentActivity(activityRes.data || []);
      setTrends(trendsRes.data || []);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    if (action.includes('REGISTER')) return Users;
    if (action.includes('VERIFY')) return CheckCircle;
    if (action.includes('ESCALATE')) return AlertTriangle;
    if (action.includes('RESOLVE')) return CheckCircle;
    if (action.includes('REJECT')) return XCircle;
    return Activity;
  };

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System overview and management</p>
          </div>
          <div className="header-actions">
            {/* 
            <Link to="/admin/settings">
              <Button variant="secondary">
                <Settings size={18} />
                Settings
              </Button>
            </Link>
            */}
          </div>
        </div>

        {/* Main Stats */}
        <div className="dashboard-stats admin-stats">
          <div className="stat-card large">
            <div className="stat-card-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Users size={28} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.totalUsers}</span>
              <span className="stat-card-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card large">
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FileText size={28} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.totalIssues}</span>
              <span className="stat-card-label">Total Issues</span>
            </div>
          </div>
          <div className="stat-card large">
            <div className="stat-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <Clock size={28} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.pendingModeration}</span>
              <span className="stat-card-label">Pending Review</span>
              <span className="stat-card-trend negative">Needs attention</span>
            </div>
          </div>
          <div className="stat-card large">
            <div className="stat-card-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <CheckCircle size={28} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.resolvedThisMonth}</span>
              <span className="stat-card-label">Resolved (Month)</span>
            </div>
          </div>
        </div>

        {/* Charts & Activity Grid */}
        <div className="admin-grid">
          {/* Chart Section */}
          <div className="dashboard-section chart-section">
            <div className="section-header">
              <h2>Issue Trends (Last 7 Days)</h2>
            </div>
            <div className="chart-container" style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="reported" name="New Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>System Logs</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((log) => {
                const Icon = getActivityIcon(log.action);
                return (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">
                      <Icon size={16} />
                    </div>
                    <div className="activity-content">
                      <p>
                        <span className="font-semibold">{log.user?.name || 'System'}</span>
                        {' '}{log.action.replace(/_/g, ' ').toLowerCase()}
                        {' '}<span className="text-secondary">{log.entityType} #{log.entityId.slice(-4)}</span>
                      </p>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <div className="empty-state-small">No recent activity</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="dashboard-section mt-6">
          <h2>Quick Management</h2>
          <div className="admin-quick-links">
            {/* TODO: Implement Users Page */}
            
            <Link to="/admin/users" className="quick-link-card">
              <Users size={24} />
              <div>
                <h4>Manage Users</h4>
                <p>{stats.totalUsers} registered users</p>
              </div>
              <ChevronRight size={20} />
            </Link> 
            
            <Link to="/moderation" className="quick-link-card">
              <Shield size={24} />
              <div>
                <h4>Moderation Queue</h4>
                <p>{stats.pendingModeration} issues pending</p>
              </div>
              <ChevronRight size={20} />
            </Link>
            {/* Pointers to future features */}
            <div className="quick-link-card disabled">
              <BarChart3 size={24} />
              <div>
                <h4>Categories</h4>
                <p>{stats.activeCategories} active (Config coming soon)</p>
              </div>
            </div>
             <div className="quick-link-card disabled">
              <MapPin size={24} />
              <div>
                <h4>Cities & Wards</h4>
                <p>{stats.citiesActive} city active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

