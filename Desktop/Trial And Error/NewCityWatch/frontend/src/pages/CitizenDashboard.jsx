import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, AlertTriangle, 
  Plus, ChevronRight, TrendingUp, MapPin 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { issuesService } from '../services/issues.service';
import { Button } from '../components/common/Button';
import './Dashboard.css';

export function CitizenDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await issuesService.getMyIssues();
      const issues = response.data || [];
      
      setRecentIssues(issues.slice(0, 5));
      setStats({
        total: issues.length,
        pending: issues.filter(i => ['REPORTED', 'UNDER_REVIEW', 'VERIFIED'].includes(i.status)).length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
        escalated: issues.filter(i => i.status === 'ESCALATED').length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      REPORTED: 'var(--gray-500)',
      UNDER_REVIEW: 'var(--warning-500)',
      VERIFIED: 'var(--primary-500)',
      ESCALATED: 'var(--danger-500)',
      ACTION_TAKEN: 'var(--success-500)',
      RESOLVED: 'var(--success-600)',
      REJECTED: 'var(--gray-400)'
    };
    return colors[status] || colors.REPORTED;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}!</h1>
            <p>Track your reported issues and their progress</p>
          </div>
          <Link to="/report">
            <Button>
              <Plus size={18} />
              Report Issue
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <FileText size={24} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.total}</span>
              <span className="stat-card-label">Total Issues</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={24} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.pending}</span>
              <span className="stat-card-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.resolved}</span>
              <span className="stat-card-label">Resolved</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.escalated}</span>
              <span className="stat-card-label">Escalated</span>
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Recent Issues</h2>
            <Link to="/my-issues" className="see-all-link">
              See All <ChevronRight size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="loading-placeholder">Loading...</div>
          ) : recentIssues.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="empty-icon" />
              <h3>No issues reported yet</h3>
              <p>Start by reporting a civic issue in your area</p>
              <Link to="/report">
                <Button>Report Your First Issue</Button>
              </Link>
            </div>
          ) : (
            <div className="issues-list">
              {recentIssues.map(issue => (
                <Link key={issue.id} to={`/issues/${issue.id}`} className="issue-list-item">
                  <div 
                    className="issue-status-dot" 
                    style={{ background: getStatusColor(issue.status) }}
                  />
                  <div className="issue-list-content">
                    <h4>{issue.title}</h4>
                    <p>
                      <MapPin size={12} />
                      {issue.address || 'Location not specified'}
                    </p>
                  </div>
                  <div className="issue-list-meta">
                    <span className="issue-status">{issue.status.replace('_', ' ')}</span>
                    <ChevronRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/report" className="quick-action-card">
              <Plus size={24} />
              <span>Report New Issue</span>
            </Link>
            <Link to="/issues" className="quick-action-card">
              <TrendingUp size={24} />
              <span>Browse All Issues</span>
            </Link>
            <Link to="/profile" className="quick-action-card">
              <FileText size={24} />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
