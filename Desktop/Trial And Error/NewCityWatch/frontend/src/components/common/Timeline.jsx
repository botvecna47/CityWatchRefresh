import React from 'react';
import { Circle, Check, Clock, AlertTriangle, XCircle, ArrowUp } from 'lucide-react';
import './Timeline.css';

const Timeline = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return <div className="timeline-empty">No status updates yet.</div>;
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'REPORTED': return { icon: Clock, color: 'text-info', bg: 'bg-info-light' };
      case 'VERIFIED': return { icon: Check, color: 'text-success', bg: 'bg-success-light' };
      case 'REJECTED': return { icon: XCircle, color: 'text-error', bg: 'bg-error-light' };
      case 'ESCALATED': return { icon: ArrowUp, color: 'text-warning', bg: 'bg-warning-light' };
      case 'RESOLVED': return { icon: Check, color: 'text-success', bg: 'bg-success-light' };
      case 'CLOSED': return { icon: Check, color: 'text-tertiary', bg: 'bg-tertiary-light' };
      default: return { icon: Circle, color: 'text-secondary', bg: 'bg-secondary' };
    }
  };

  return (
    <div className="timeline">
      {events.map((event, index) => {
        const config = getStatusConfig(event.toStatus);
        const Icon = config.icon;
        
        return (
          <div key={event.id} className="timeline-item">
            <div className="timeline-marker">
              <div className={`timeline-icon ${config.bg} ${config.color}`}>
                <Icon size={16} />
              </div>
              {index < events.length - 1 && <div className="timeline-line"></div>}
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header">
                <span className={`timeline-status ${config.color}`}>
                  {event.toStatus.replace('_', ' ')}
                </span>
                <span className="timeline-date">
                  {new Date(event.createdAt).toLocaleDateString()} at {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {event.user && (
                <div className="timeline-actor">
                  Updated by <strong>{event.user.name}</strong> ({event.user.role?.toLowerCase()})
                </div>
              )}
              
              {event.reason && (
                <p className="timeline-reason">{event.reason}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
