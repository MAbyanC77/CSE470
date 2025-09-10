import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ApplicationProgress.css';

const ApplicationProgress = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Progress stages with their order and descriptions
  const progressStages = [
    {
      key: 'submitted',
      title: 'Application Submitted',
      description: 'Your application has been successfully submitted',
      icon: '📝',
      color: '#28a745'
    },
    {
      key: 'under_review',
      title: 'Under Review',
      description: 'Admissions committee is reviewing your application',
      icon: '👀',
      color: '#17a2b8'
    },
    {
      key: 'interview_scheduled',
      title: 'Interview Scheduled',
      description: 'Interview has been scheduled (if applicable)',
      icon: '🎤',
      color: '#fd7e14'
    },
    {
      key: 'final_review',
      title: 'Final Review',
      description: 'Application is in final review stage',
      icon: '⚖️',
      color: '#6f42c1'
    },
    {
      key: 'decision',
      title: 'Decision Made',
      description: 'Admission decision has been made',
      icon: '🎯',
      color: '#dc3545'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchApplicationProgress();
  }, [applicationId, isAuthenticated, navigate]);

  const fetchApplicationProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/applications/${applicationId}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApplication(response.data.application);
    } catch (error) {
      console.error('Error fetching application progress:', error);
      setError('Failed to load application progress');
      toast.error('Failed to load application progress');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStageIndex = () => {
    if (!application) return 0;
    
    switch (application.status) {
      case 'pending':
        return 0; // submitted
      case 'under_review':
        return 1;
      case 'interview_scheduled':
        return 2;
      case 'final_review':
        return 3;
      case 'accepted':
      case 'declined':
      case 'waitlisted':
        return 4; // decision
      default:
        return 0;
    }
  };

  const getProgressPercentage = () => {
    const currentStage = getCurrentStageIndex();
    return ((currentStage + 1) / progressStages.length) * 100;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#28a745';
      case 'declined': return '#dc3545';
      case 'waitlisted': return '#ffc107';
      case 'under_review': return '#17a2b8';
      case 'pending': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'declined': return '❌';
      case 'waitlisted': return '⏳';
      case 'under_review': return '👀';
      case 'pending': return '📝';
      default: return '📝';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="application-progress">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading application progress...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="application-progress">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Error Loading Progress</h3>
          <p>{error || 'Application not found'}</p>
          <button className="btn-back" onClick={() => navigate('/deadline-tracker')}>
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const progressPercentage = getProgressPercentage();

  return (
    <div className="application-progress">
      {/* Header */}
      <div className="progress-header">
        <button className="btn-back" onClick={() => navigate('/deadline-tracker')}>
          ← Back to Applications
        </button>
        <div className="header-content">
          <h1>📊 Application Progress</h1>
          <div className="application-info">
            <div className="university-details">
              {application.university.logoUrl && (
                <img 
                  src={application.university.logoUrl} 
                  alt={application.university.name}
                  className="university-logo"
                />
              )}
              <div>
                <h2>{application.university.name}</h2>
                <p>{application.subject} • {application.academicYear}</p>
                <p>{application.university.city}, {application.university.country}</p>
              </div>
            </div>
            <div className="current-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {getStatusIcon(application.status)} {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-percentage">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="timeline-section">
        <h3>Application Timeline</h3>
        <div className="timeline">
          {progressStages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            return (
              <div 
                key={stage.key}
                className={`timeline-item ${
                  isCompleted ? 'completed' : 'pending'
                } ${isCurrent ? 'current' : ''}`}
              >
                <div className="timeline-marker">
                  <div 
                    className="timeline-icon"
                    style={{ 
                      backgroundColor: isCompleted ? stage.color : '#e9ecef',
                      color: isCompleted ? 'white' : '#6c757d'
                    }}
                  >
                    {stage.icon}
                  </div>
                </div>
                <div className="timeline-content">
                  <h4>{stage.title}</h4>
                  <p>{stage.description}</p>
                  {isCurrent && (
                    <div className="current-indicator">
                      <span className="pulse"></span>
                      Current Stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status History */}
      {application.statusHistory && application.statusHistory.length > 0 && (
        <div className="history-section">
          <h3>Status History</h3>
          <div className="status-history">
            {application.statusHistory.map((history, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {formatDate(history.date)}
                </div>
                <div className="history-status">
                  <span 
                    className="history-badge"
                    style={{ backgroundColor: getStatusColor(history.status) }}
                  >
                    {getStatusIcon(history.status)} {history.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {history.note && (
                  <div className="history-note">
                    {history.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Details */}
      <div className="details-section">
        <h3>Application Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Application ID:</span>
            <span className="detail-value">{application._id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Submitted:</span>
            <span className="detail-value">{formatDate(application.createdAt)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">{formatDate(application.updatedAt)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Scholarship Applied:</span>
            <span className="detail-value">
              {application.applyingForScholarship ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          {application.preferredStartDate && (
            <div className="detail-item">
              <span className="detail-label">Preferred Start Date:</span>
              <span className="detail-value">
                {new Date(application.preferredStartDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="next-steps-section">
        <h3>Next Steps</h3>
        <div className="next-steps">
          {application.status === 'pending' && (
            <div className="step-item">
              <span className="step-icon">⏳</span>
              <div>
                <h4>Wait for Review</h4>
                <p>Your application is in queue for review. You'll be notified of any updates.</p>
              </div>
            </div>
          )}
          {application.status === 'under_review' && (
            <div className="step-item">
              <span className="step-icon">📧</span>
              <div>
                <h4>Check Your Email</h4>
                <p>The admissions team may contact you for additional information or to schedule an interview.</p>
              </div>
            </div>
          )}
          {application.status === 'accepted' && (
            <div className="step-item">
              <span className="step-icon">🎉</span>
              <div>
                <h4>Congratulations!</h4>
                <p>Your application has been accepted. Check your email for enrollment instructions.</p>
              </div>
            </div>
          )}
          {application.status === 'declined' && (
            <div className="step-item">
              <span className="step-icon">💪</span>
              <div>
                <h4>Don't Give Up</h4>
                <p>Consider applying to other programs or reapplying next cycle with an improved application.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationProgress;