import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, Building, AlertTriangle, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { issuesService } from '../services/issues.service';
import EvidenceGallery from '../components/common/EvidenceGallery';
import Timeline from '../components/common/Timeline';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Card } from '../components/common/Card';
import './IssueDetailPage.css';

// Fix leafet icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const IssueDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const response = await issuesService.getIssue(id);
                // Axios interceptor already unwraps response.data
                if (response.success) {
                    setIssue(response.data);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load issue details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchIssue();
    }, [id]);

    if (loading) return <div className="page-loading"><Spinner size="large" /></div>;
    if (!issue) return <div className="page-error">Issue not found</div>;

    const formattedDate = new Date(issue.createdAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="issue-detail-page">
            <div className="detail-container">
                {/* Header Actions */}
                <div className="detail-header-actions">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={20} /> Back
                    </Button>
                    <div className="issue-id">ID: #{issue.id.slice(-6).toUpperCase()}</div>
                </div>

                <div className="detail-grid">
                    {/* Left Column: Main Content */}
                    <div className="detail-main">
                        <div className="detail-header">
                            <h1 className="issue-title">{issue.title}</h1>
                            <div className="issue-meta-row">
                                <Badge variant={issue.status.toLowerCase()}>{issue.status.replace('_', ' ')}</Badge>
                                <span className="meta-separator">•</span>
                                <span className="meta-date">{formattedDate}</span>
                                <span className="meta-separator">•</span>
                                <span className="meta-category">{issue.category.name}</span>
                            </div>
                        </div>

                        <Card className="content-card">
                            <h3 className="section-title">Description</h3>
                            <p className="issue-description">{issue.description}</p>
                            
                            {issue.expectedOutcome && (
                                <div className="expected-outcome">
                                    <strong>Expected Outcome:</strong> {issue.expectedOutcome}
                                </div>
                            )}
                        </Card>

                        <Card className="content-card">
                            <h3 className="section-title">Evidence</h3>
                            <EvidenceGallery evidence={issue.evidence} />
                        </Card>

                        <Card className="content-card">
                            <h3 className="section-title">Timeline</h3>
                            <Timeline events={issue.statusUpdates} />
                        </Card>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="detail-sidebar">
                        {/* Map Card */}
                        <Card className="sidebar-card map-card">
                            <div className="map-view">
                                <MapContainer 
                                    center={[issue.latitude || 21.1458, issue.longitude || 79.0882]} 
                                    zoom={14} 
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                    scrollWheelZoom={false}
                                    dragging={false}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {issue.latitude && (
                                        <Marker position={[issue.latitude, issue.longitude]} />
                                    )}
                                </MapContainer>
                            </div>
                            <div className="location-details">
                                <div className="location-row">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{issue.address || 'Location pinned on map'}</span>
                                </div>
                                <div className="location-row">
                                    <Building size={16} className="text-tertiary" />
                                    <span>Ward: {issue.ward?.name || 'Unassigned'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Reporter & Severity */}
                        <Card className="sidebar-card">
                           <h4 className="sidebar-title">Ticket Info</h4>
                           
                           <div className="info-row">
                                <User size={16} />
                                <div>
                                    <span className="label">Reported by</span>
                                    <span className="value">
                                        {/* Privacy: Obfuscate name if not admin/mod, usually? MVP shows name */}
                                        {issue.reporter.name}
                                    </span>
                                </div>
                           </div>

                           <div className="info-row">
                                <AlertTriangle size={16} />
                                <div>
                                    <span className="label">Severity</span>
                                    <span className="value">{issue.severity}</span>
                                </div>
                           </div>

                           <div className="info-row">
                                <Building size={16} />
                                <div>
                                    <span className="label">Department</span>
                                    <span className="value">{issue.department?.name || 'Pending Assignment'}</span>
                                </div>
                           </div>
                        </Card>

                        {/* Admin Actions (Future: If User is Admin/Mod) */}
                        {/* <div className="admin-actions">
                             <Button fullWidth>Verify Issue</Button>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailPage;
