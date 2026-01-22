import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Loader, FileX } from 'lucide-react';
import { issuesService } from '../services/issues.service';
import { Button } from '../components/common/Button';
import { IssueCard } from '../components/common/IssueCard';
import './IssuesPage.css';

export function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    sort: 'newest'
  });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await issuesService.getIssues(filters);
      setIssues(response.data || []);
    } catch (err) {
      setError('Failed to load issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="issues-page">
      {/* Header */}
      <div className="issues-header">
        <div className="issues-header-top">
          <div>
            <h1 className="issues-title">Civic Issues</h1>
            <p className="issues-subtitle">Browse and track reported issues in your city</p>
          </div>
          <Link to="/report">
            <Button>Report New Issue</Button>
          </Link>
        </div>
        
        {/* Filters */}
        <div className="issues-filters">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="ESCALATED">Escalated</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          
          <div className="category-tabs">
            {['All', 'Roads', 'Waste', 'Lights', 'Water', 'Drainage'].map(cat => (
              <button 
                key={cat}
                className={`category-tab ${filters.category === cat || (cat === 'All' && !filters.category) ? 'category-tab-active' : ''}`}
                onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="filter-group">
            <select 
              className="filter-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="unresolved">Longest Unresolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="issues-loading">
          <Loader className="spinner spinner-lg" />
          <p>Loading issues...</p>
        </div>
      ) : error ? (
        <div className="issues-empty">
          <FileX className="issues-empty-icon" />
          <h3>Failed to load issues</h3>
          <p>{error}</p>
          <Button onClick={fetchIssues}>Try Again</Button>
        </div>
      ) : issues.length === 0 ? (
        <div className="issues-empty">
          <FileX className="issues-empty-icon" />
          <h3>No issues found</h3>
          <p>No civic issues match your current filters</p>
          <Button onClick={() => setFilters({ status: '', category: '', sort: 'newest' })}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="issues-grid">
          {issues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}

export default IssuesPage;
