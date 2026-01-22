import React, { useState, useEffect } from 'react';
import { User, Award, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/auth.service';
import { issuesService } from '../services/issues.service';
import { IssueCard } from '../components/common/IssueCard';
import { Spinner } from '../components/common/Spinner';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import './UserProfilePage.css';

const UserProfilePage = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ reported: 0, resolved: 0 }); // Derived or fetched
    const [myIssues, setMyIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
             try {
                 // Fetch User Profile (interceptor already unwraps)
                 const userRes = await authService.getCurrentUser();
                 if (userRes.success) {
                     setUser(userRes.data.user);
                 }

                 // Fetch My Issues (interceptor already unwraps)
                 const issuesRes = await issuesService.getMyIssues();
                 const issues = issuesRes.data || [];
                 setMyIssues(issues);
                 
                 // Calculate simple stats
                 const resolvedCount = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
                 setStats({
                     reported: issues.length,
                     resolved: resolvedCount
                 });
             } catch (error) {
                 console.error(error);
                 toast.error('Failed to load profile data');
             } finally {
                 setLoading(false);
             }
        };

        fetchProfileData();
    }, []);

    if (loading) return <div className="page-loading"><Spinner size="large" /></div>;
    if (!user) return <div className="page-error">User not found</div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header Card */}
                <Card className="profile-header-card">
                     <div className="profile-header">
                         <div className="profile-avatar">
                             <User size={40} />
                         </div>
                         <div className="profile-info">
                             <h1 className="profile-name">{user.name}</h1>
                             <div className="profile-badges">
                                 <span className="role-badge">{user.role.toLowerCase()}</span>
                                 {user.isVerified && <span className="verified-badge">Verified <CheckCircle size={12} /></span>}
                             </div>
                             <p className="profile-joined">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                         </div>
                         <div className="credibility-score">
                             <div className="score-label">Trust Score</div>
                             <div className="score-value">{user.credibilityScore}</div>
                         </div>
                     </div>
                </Card>

                {/* Impact Stats */}
                <div className="stats-grid">
                    <Card className="stat-card">
                        <div className="stat-icon bg-blue-100 text-blue-600">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.reported}</h3>
                            <p>Issues Reported</p>
                        </div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-icon bg-green-100 text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.resolved}</h3>
                            <p>Issues Resolved</p>
                        </div>
                    </Card>
                    <Card className="stat-card">
                         <div className="stat-icon bg-purple-100 text-purple-600">
                             <Award size={24} />
                         </div>
                         <div className="stat-content">
                             <h3>Top 10%</h3>
                             <p>City Ranking</p>
                         </div>
                    </Card>
                </div>

                {/* My Issues List */}
                <div className="my-issues-section">
                    <div className="section-header">
                        <h2>My Reports ({myIssues.length})</h2>
                        {/* Could add tabs for Active / Resolved here */}
                    </div>

                    {myIssues.length === 0 ? (
                        <Card className="empty-state">
                            <p>You haven't reported any issues yet.</p>
                            <Button variant="outline" onClick={() => window.location.href='/report'}>Report an Issue</Button>
                        </Card>
                    ) : (
                        <div className="issues-grid">
                            {myIssues.map(issue => (
                                <IssueCard key={issue.id} issue={issue} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
