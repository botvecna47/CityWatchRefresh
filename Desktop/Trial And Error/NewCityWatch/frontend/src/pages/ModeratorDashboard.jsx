import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, Clock, AlertTriangle, CheckCircle, XCircle,
  Eye, MapPin, Calendar, ArrowUp
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { moderationService } from '../services/moderation.service';
import { Button } from '../components/common/Button';
import { VerificationModal } from '../components/moderation/VerificationModal';
import { toast } from 'react-toastify';
import './Dashboard.css';

export function ModeratorDashboard() {
  const { user } = useAuthStore();
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    verifiedToday: 0,
    rejectedToday: 0,
    escalated: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await moderationService.getQueue();
      const issues = response.data || [];
      setQueue(issues);
      setStats({
        pending: issues.length,
        verifiedToday: 0, // Ideally fetch real stats
        rejectedToday: 0,
        escalated: issues.filter(i => i.status === 'ESCALATED').length
      });
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async (issueId, data) => {
    await moderationService.verifyIssue(issueId, data);
    toast.success('Issue verified successfully');
    refresh();
  };

  const onReject = async (issueId, reason, notes) => {
    await moderationService.rejectIssue(issueId, { reason, notes });
    toast.success('Issue rejected');
    refresh();
  };

  const onEscalate = async (issueId, reason) => {
    await moderationService.escalateIssue(issueId, { reason });
    toast.success('Issue escalated');
    refresh();
  };

  const refresh = () => {
    fetchQueue();
    setSelectedIssue(null);
  };

  const openProcessModal = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  return (
    <div className="dashboard moderator-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Moderation Dashboard</h1>
            <p>Review and verify reported issues</p>
          </div>
          <div className="header-badge">
            <FileCheck size={16} />
            <span>{stats.pending} pending review</span>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Clock size={24} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stats.pending}</span>
              <span className="stat-card-label">Pending Review</span>
            </div>
          </div>
          {/* Add more stats if API supports it */}
        </div>

        {/* Moderation Queue */}
        <div className="moderation-content">
          <div className="queue-panel">
            <div className="panel-header">
              <h2>Review Queue</h2>
            </div>
            
            {loading ? (
              <div className="loading-placeholder">Loading queue...</div>
            ) : queue.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} className="empty-icon" />
                <h3>Queue is empty!</h3>
                <p>All issues have been reviewed</p>
              </div>
            ) : (
              <div className="queue-list">
                {queue.map(issue => (
                  <div 
                    key={issue.id}
                    className={`queue-item ${selectedIssue?.id === issue.id ? 'active' : ''}`}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="queue-item-header">
                      <span className={`severity-badge severity-${issue.severity?.toLowerCase()}`}>
                        {issue.severity}
                      </span>
                      <span className="queue-time">
                        <Calendar size={12} />
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4>{issue.title}</h4>
                    <p>
                      <MapPin size={12} />
                      {issue.address || 'No address'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="detail-panel">
            {selectedIssue ? (
              <>
                <div className="panel-header">
                  <h2>Issue Details</h2>
                  <Link to={`/issues/${selectedIssue.id}`} target="_blank" className="view-link">
                    Open Public Page <Eye size={14} />
                  </Link>
                </div>
                <div className="detail-content">
                  <h3>{selectedIssue.title}</h3>
                  <p className="detail-description">{selectedIssue.description}</p>
                  
                  {/* Improved Media Grid */}
                  {selectedIssue.evidence && selectedIssue.evidence.length > 0 && (
                     <div className="detail-media-preview">
                        {selectedIssue.evidence.map((ev) => (
                          <div key={ev.id} className="media-thumbnail">
                             {ev.type === 'IMAGE' ? (
                               <img src={`http://localhost:5000${ev.filePath}`} alt="Evidence" />
                             ) : (
                               <div className="video-placeholder">Video</div>
                             )}
                          </div>
                        ))}
                     </div>
                  )}

                  <div className="detail-meta">
                    <div className="meta-item">
                      <span className="meta-label">Category</span>
                      <span className="meta-value">{selectedIssue.category?.name}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Location</span>
                      <span className="meta-value">
                        <MapPin size={14} /> {selectedIssue.location}
                      </span>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <Button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full"
                    >
                      Process Issue
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-detail">
                <Eye size={48} />
                <h3>Select an issue to review</h3>
                <p>Click on an issue from the queue to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <VerificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issue={selectedIssue}
        onVerify={onVerify}
        onReject={onReject}
        onEscalate={onEscalate}
      />
    </div>
  );
}
