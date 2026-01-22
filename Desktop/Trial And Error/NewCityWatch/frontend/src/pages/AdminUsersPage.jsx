import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, MoreVertical, Shield, CheckCircle, XCircle 
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { Button } from '../components/common/Button';
import './Dashboard.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>User Management</h1>
            <p>View and manage registered users</p>
          </div>
          <div className="header-actions">
            {/* Future: Add User Button */}
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-section" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="search-box" style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input 
                type="text" 
                placeholder="Search by name, email, or phone..." 
                className="form-input"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Future: Role Filter */}
          </div>
        </div>

        {/* Users Table */}
        <div className="dashboard-section" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
             <div className="loading-placeholder">Loading users...</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
                    {/* <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)', fontWeight: '600', fontSize: '0.875rem' }}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: 'var(--gray-900)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user.email || user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`role-badge role-${user.role.toLowerCase()}`} style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '999px',
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          background: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'MODERATOR' ? '#fef3c7' : '#e0f2fe',
                          color: user.role === 'ADMIN' ? '#991b1b' : user.role === 'MODERATOR' ? '#92400e' : '#075985' 
                        }}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {user.isVerified ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success-600)', fontSize: '0.875rem' }}>
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>Unverified</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      {/* 
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                      */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
