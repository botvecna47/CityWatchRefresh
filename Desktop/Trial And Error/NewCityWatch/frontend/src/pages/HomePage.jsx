import { Link } from 'react-router-dom';
import { Camera, FileCheck, TrendingUp, CheckCircle, X, Check, ArrowRight, Shield, Users } from 'lucide-react';
import { Button } from '../components/common/Button';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Shield size={16} />
            <span>Civic Accountability Platform</span>
          </div>
          <h1 className="hero-title">
            Report Civic Issues.<br />
            <span className="hero-title-gradient">Track Real Progress.</span>
          </h1>
          <p className="hero-subtitle">
            Document public infrastructure failures with verified photo evidence. 
            Hold authorities accountable with transparent tracking.
          </p>
          <div className="hero-actions">
            <Link to="/issues">
              <Button variant="white" size="lg">
                Browse Issues
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="outline-white" size="lg">Report an Issue</Button>
            </Link>
          </div>
          <div className="hero-trust">
            <Users size={18} />
            <span>Trusted by <strong>1,200+</strong> citizens in <strong>3</strong> cities</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card stat-card-animate" style={{'--delay': '0s'}}>
              <div className="stat-icon stat-icon-blue">
                <FileCheck size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">1,247</div>
                <div className="stat-label">Issues Reported</div>
              </div>
            </div>
            <div className="stat-card stat-card-animate" style={{'--delay': '0.1s'}}>
              <div className="stat-icon stat-icon-green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">892</div>
                <div className="stat-label">Issues Resolved</div>
              </div>
            </div>
            <div className="stat-card stat-card-animate" style={{'--delay': '0.2s'}}>
              <div className="stat-icon stat-icon-purple">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">71%</div>
                <div className="stat-label">Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2>How CityWatch Works</h2>
            <p>A simple 4-step process from report to resolution</p>
          </div>
          <div className="steps-grid">
            {[
              { icon: Camera, title: 'Report with Photo', desc: 'Document the issue with clear photo evidence and geo-tagged location' },
              { icon: FileCheck, title: 'Moderator Verifies', desc: 'Trained moderators review and validate the authenticity of the report' },
              { icon: TrendingUp, title: 'Track Progress', desc: 'Follow the complete timeline as authorities take action' },
              { icon: CheckCircle, title: 'Issue Resolved', desc: 'Authority confirms resolution with evidence of work done' }
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{i + 1}</div>
                <div className="step-icon-wrapper">
                  <step.icon size={28} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We're Not */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Values</span>
            <h2>What CityWatch is NOT</h2>
            <p>We're a serious civic tool, not another social media platform</p>
          </div>
          
          <div className="values-grid">
            <div className="values-column">
              {[
                { title: 'NOT Social Media', desc: 'No likes, comments, or trending. Just facts and evidence.' },
                { title: 'NOT Political', desc: 'Focused on infrastructure issues, not political debates.' },
                { title: 'NOT for Personal Disputes', desc: 'Only public infrastructure and civic issues.' },
                { title: 'NOT for Viral Content', desc: 'Evidence-based reporting, not engagement farming.' }
              ].map((item, i) => (
                <div key={i} className="value-card value-card-not">
                  <div className="value-icon-not">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <div className="value-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="values-column">
              {[
                { title: 'Transparent & Evidence-Based', desc: 'Every report backed by photo evidence and verification process.' },
                { title: 'Accountable & Trackable', desc: 'Complete timeline from report to resolution with authority responses.' }
              ].map((item, i) => (
                <div key={i} className="value-card value-card-yes">
                  <div className="value-icon-yes">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div className="value-content">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to make your city better?</h2>
              <p>Join citizens holding local authorities accountable through verified evidence and transparent tracking.</p>
              <div className="cta-actions">
                <Link to="/register">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/issues" className="cta-link">
                  View recent issues →
                </Link>
              </div>
            </div>
            <div className="cta-decoration">
              <div className="cta-circle cta-circle-1"></div>
              <div className="cta-circle cta-circle-2"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
