import './Badge.css';

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusMap = {
    REPORTED: 'reported',
    UNDER_REVIEW: 'under-review',
    VERIFIED: 'verified',
    ESCALATED: 'escalated',
    ACTION_TAKEN: 'action-taken',
    CLOSED: 'resolved',
    RESOLVED: 'resolved',
    REJECTED: 'rejected',
  };

  const labels = {
    REPORTED: 'Reported',
    UNDER_REVIEW: 'Under Review',
    VERIFIED: 'Verified',
    ESCALATED: 'Escalated',
    ACTION_TAKEN: 'Action Taken',
    CLOSED: 'Closed',
    RESOLVED: 'Resolved',
    REJECTED: 'Rejected',
  };

  return (
    <Badge variant={statusMap[status] || 'default'}>
      {labels[status] || status}
    </Badge>
  );
}

export function SeverityBadge({ severity }) {
  const severityMap = {
    LOW: 'severity-low',
    MEDIUM: 'severity-medium',
    HIGH: 'severity-high',
    CRITICAL: 'severity-critical',
  };

  return (
    <Badge variant={severityMap[severity] || 'default'} size="sm">
      {severity}
    </Badge>
  );
}
