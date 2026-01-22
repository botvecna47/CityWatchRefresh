import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUp } from 'lucide-react';
import { StatusBadge, SeverityBadge } from './Badge';
import './IssueCard.css'; // Will create this or use shared styles

export function IssueCard({ issue }) {
  const daysAgo = Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Link to={`/issues/${issue.id}`} className="issue-card">
      <div className="issue-card-header">
        <div className="issue-card-badges">
          <StatusBadge status={issue.status} />
          <SeverityBadge severity={issue.severity} />
        </div>
        <div className="issue-card-date">
          <Calendar size={14} />
          <span>{daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}</span>
        </div>
      </div>
      
      <h3 className="issue-card-title">{issue.title}</h3>
      <p className="issue-card-description">{issue.description}</p>
      
      <div className="issue-card-location">
        <MapPin size={14} />
        <span>{issue.address || 'Location details unavailable'}</span> 
        {/* Adjusted to avoid null crash if location missing */}
      </div>
      
      {daysAgo > 7 && issue.status !== 'RESOLVED' && issue.status !== 'REJECTED' && (
        <div className="issue-card-warning">
          ⚠️ {daysAgo} days unresolved
        </div>
      )}
      
      <div className="issue-card-footer">
        <span className="badge badge-category">
          {issue.category?.name || 'General'}
        </span>
        <div className="issue-card-upvotes">
          <ArrowUp size={16} />
          <span>{issue.upvoteCount || 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default IssueCard;
