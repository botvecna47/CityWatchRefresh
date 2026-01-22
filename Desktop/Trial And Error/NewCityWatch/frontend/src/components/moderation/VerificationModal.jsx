import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Building2 } from 'lucide-react';
import { Button } from '../common/Button';
import { issuesService } from '../../services/issues.service';
import './VerificationModal.css';

export function VerificationModal({ 
  isOpen, 
  onClose, 
  issue, 
  onVerify, 
  onReject, 
  onEscalate 
}) {
  const [mode, setMode] = useState('VERIFY'); // VERIFY, REJECT, ESCALATE
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  // Form State
  const [departmentId, setDepartmentId] = useState('');
  const [severity, setSeverity] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  // Reset state when modal opens/closes or issue changes
  useEffect(() => {
    if (isOpen && issue) {
      setMode('VERIFY');
      setDepartmentId(issue.departmentId || '');
      setSeverity(issue.severity || 'MEDIUM');
      setNotes('');
      setReason('');
      fetchDepartments(issue.cityId);
    }
  }, [isOpen, issue]);

  const fetchDepartments = async (cityId) => {
    try {
      const response = await issuesService.getDepartments(cityId);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Failed to load departments', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'VERIFY') {
        if (!departmentId) {
          alert('Please assign a department');
          setLoading(false);
          return;
        }
        await onVerify(issue.id, { departmentId, severity, notes });
      } else if (mode === 'REJECT') {
        if (!reason) {
          alert('Please provide a rejection reason');
          setLoading(false);
          return;
        }
        await onReject(issue.id, reason, notes);
      } else if (mode === 'ESCALATE') {
        await onEscalate(issue.id, reason || 'Escalated by moderator');
      }
      onClose();
    } catch (error) {
      console.error('Action failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container verification-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <h2>Process Issue #{issue.id.slice(-4)}</h2>
          <div className="modal-tabs">
            <button 
              className={`modal-tab ${mode === 'VERIFY' ? 'active' : ''}`}
              onClick={() => setMode('VERIFY')}
            >
              <CheckCircle size={16} /> Verify
            </button>
            <button 
              className={`modal-tab ${mode === 'REJECT' ? 'active' : ''}`}
              onClick={() => setMode('REJECT')}
            >
              <XCircle size={16} /> Reject
            </button>
            <button 
              className={`modal-tab ${mode === 'ESCALATE' ? 'active' : ''}`}
              onClick={() => setMode('ESCALATE')}
            >
              <AlertTriangle size={16} /> Escalate
            </button>
          </div>
        </div>

        <div className="modal-content">
          {mode === 'VERIFY' && (
            <div className="form-section">
              <label className="form-label">
                Assign Department <span className="required">*</span>
              </label>
              <select 
                className="form-select"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>

              <label className="form-label">Severity Level</label>
              <div className="severity-options">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(lev => (
                  <button
                    key={lev}
                    className={`severity-option ${severity === lev ? 'selected' : ''} ${lev.toLowerCase()}`}
                    onClick={() => setSeverity(lev)}
                  >
                    {lev}
                  </button>
                ))}
              </div>

              <label className="form-label">Internal Notes (Optional)</label>
              <textarea 
                className="form-textarea"
                placeholder="Add notes for the department..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {mode === 'REJECT' && (
            <div className="form-section">
              <div className="warning-box">
                <AlertTriangle size={20} />
                <p>Rejecting this issue will hide it from the public feed. This action cannot be easily undone.</p>
              </div>

              <label className="form-label">
                Rejection Reason <span className="required">*</span>
              </label>
              <select 
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select Reason</option>
                <option value="Duplicate Issue">Duplicate Issue</option>
                <option value="Not a civic issue">Not a civic issue</option>
                <option value="Lack of evidence">Lack of evidence / unclear photo</option>
                <option value="Spam / Abuse">Spam / Abuse</option>
                <option value="Private property">Private property (Out of scope)</option>
                <option value="Other">Other</option>
              </select>

              <label className="form-label">Additional Comments</label>
              <textarea 
                className="form-textarea"
                placeholder="Explain why this is being rejected..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {mode === 'ESCALATE' && (
            <div className="form-section">
               <div className="info-box">
                <AlertTriangle size={20} />
                <p>Escalating will mark this as HIGH priority and notify city admins.</p>
              </div>

              <label className="form-label">Escalation Reason</label>
              <textarea 
                className="form-textarea"
                placeholder="Why does this need urgent attention?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={mode === 'REJECT' ? 'danger' : mode === 'ESCALATE' ? 'warning' : 'primary'}
            onClick={handleSubmit}
            loading={loading}
          >
            {mode === 'VERIFY' ? 'Verify & Assign' : mode === 'REJECT' ? 'Reject Issue' : 'Escalate Issue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
