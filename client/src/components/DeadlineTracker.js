import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DeadlineTracker.css';

const DeadlineTracker = () => {
  const { user } = useContext(AuthContext);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    withinDays: '',
    country: '',
    degreeLevel: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [appliedUniversities, setAppliedUniversities] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [activeTab, setActiveTab] = useState('deadlines'); // 'deadlines' or 'applications'

  // Fetch deadlines
  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.withinDays) params.append('withinDays', filters.withinDays);
      if (filters.country) params.append('country', filters.country);
      if (filters.degreeLevel) params.append('degreeLevel', filters.degreeLevel);
      
      const response = await axios.get(`/api/deadlines?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setDeadlines(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      toast.error('Failed to fetch deadlines');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/deadlines/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Remove program from tracker
  const removeProgram = async (savedProgramId) => {
    try {
      const response = await axios.delete(`/api/deadlines/remove/${savedProgramId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        toast.success('Program removed from deadline tracker');
        fetchDeadlines();
      }
    } catch (error) {
      console.error('Error removing program:', error);
      toast.error('Failed to remove program');
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId) => {
    try {
      await axios.put(`/api/deadlines/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'urgent': return 'status-urgent';
      case 'warning': return 'status-warning';
      case 'active': return 'status-active';
      case 'expired': return 'status-expired';
      default: return 'status-active';
    }
  };

  // Format deadline display
  const formatDeadline = (program, daysLeft) => {
    if (program.rolling) {
      return <span className="rolling-badge">Rolling</span>;
    }
    
    const deadline = new Date(program.applicationDeadline);
    const dateStr = deadline.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    if (daysLeft < 0) {
      return <span className="expired-deadline">{dateStr} (Expired)</span>;
    }
    
    return (
      <div className="deadline-info">
        <div className="deadline-date">{dateStr}</div>
        <div className={`days-left ${getStatusClass(getDeadlineStatus(daysLeft))}`}>
          {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
        </div>
      </div>
    );
  };

  // Get deadline status
  const getDeadlineStatus = (daysLeft) => {
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 30) return 'warning';
    return 'active';
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchDeadlines();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      withinDays: '',
      country: '',
      degreeLevel: ''
    });
    setTimeout(() => fetchDeadlines(), 100);
  };

  // Fetch applied universities
  const fetchAppliedUniversities = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAppliedUniversities(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applied universities:', error);
      toast.error('Failed to load applied universities');
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeadlines();
      fetchNotifications();
      fetchAppliedUniversities();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="deadline-tracker">
        <div className="auth-required">
          <h2>Please log in to access Deadline Tracker</h2>
          <p>Track application deadlines for your saved programs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deadline-tracker">
      {/* Header */}
      <div className="tracker-header">
        <div className="header-content">
          <h1>📅 Deadline Tracker</h1>
          <p>Track application deadlines for your saved programs</p>
        </div>
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notifications-section">
            <button 
              className="notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔 {notifications.length} Alert{notifications.length !== 1 ? 's' : ''}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                {notifications.map(notification => (
                  <div key={notification._id} className="notification-item">
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                    </div>
                    <button 
                      className="mark-read-btn"
                      onClick={() => markNotificationRead(notification._id)}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Show deadlines within:</label>
            <select 
              name="withinDays" 
              value={filters.withinDays} 
              onChange={handleFilterChange}
            >
              <option value="">All deadlines</option>
              <option value="7">Next 7 days</option>
              <option value="30">Next 30 days</option>
              <option value="90">Next 3 months</option>
              <option value="180">Next 6 months</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Country:</label>
            <select 
              name="country" 
              value={filters.country} 
              onChange={handleFilterChange}
            >
              <option value="">All countries</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="UK">UK</option>
              <option value="Australia">Australia</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Netherlands">Netherlands</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Degree Level:</label>
            <select 
              name="degreeLevel" 
              value={filters.degreeLevel} 
              onChange={handleFilterChange}
            >
              <option value="">All levels</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
              <option value="Diploma">Diploma</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-apply" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn-clear" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'deadlines' ? 'active' : ''}`}
          onClick={() => setActiveTab('deadlines')}
        >
          📅 Deadline Tracker
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          📝 Applied Universities
        </button>
      </div>

      {/* Content */}
      <div className="tracker-content">
        {activeTab === 'deadlines' ? (
          // Deadlines Tab Content
          loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your deadlines...</p>
            </div>
          ) : deadlines.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No saved programs yet</h3>
              <p>Start by saving programs from the University Finder to track their deadlines.</p>
              <a href="/universities" className="btn-primary">
                Browse Universities
              </a>
            </div>
          ) : (
            <div className="deadlines-table-container">
              <table className="deadlines-table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Program</th>
                    <th>Level</th>
                    <th>Duration</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deadlines.map(deadline => (
                    <tr key={deadline._id} className={getStatusClass(deadline.status)}>
                      <td>
                        <div className="university-info">
                          {deadline.university.logoUrl && (
                            <img 
                              src={deadline.university.logoUrl} 
                              alt={deadline.university.name}
                              className="university-logo"
                            />
                          )}
                          <div>
                            <div className="university-name">{deadline.university.name}</div>
                            <div className="university-location">
                              {deadline.university.city}, {deadline.university.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="program-name">{deadline.program.name}</div>
                      </td>
                      <td>
                        <span className="level-badge">{deadline.program.level}</span>
                      </td>
                      <td>{deadline.program.duration}</td>
                      <td>
                        {formatDeadline(deadline.program, deadline.daysLeft)}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(deadline.status)}`}>
                          {deadline.status === 'urgent' && '🔴 Urgent'}
                          {deadline.status === 'warning' && '🟡 Soon'}
                          {deadline.status === 'active' && '🟢 Active'}
                          {deadline.status === 'expired' && '⚫ Expired'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-remove"
                          onClick={() => removeProgram(deadline._id)}
                          title="Remove from tracker"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Applied Universities Tab Content
          loadingApplications ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your applications...</p>
            </div>
          ) : appliedUniversities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No applications yet</h3>
              <p>Start applying to universities to track your application status here.</p>
              <a href="/universities" className="btn-primary">
                Browse Universities
              </a>
            </div>
          ) : (
            <div className="applications-table-container">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Subject</th>
                    <th>Academic Year</th>
                    <th>Scholarship</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appliedUniversities.map(application => (
                    <tr key={application._id} className={`application-${application.status}`}>
                      <td>
                        <div className="university-info">
                          {application.university.logoUrl && (
                            <img 
                              src={application.university.logoUrl} 
                              alt={application.university.name}
                              className="university-logo"
                            />
                          )}
                          <div>
                            <div className="university-name">{application.university.name}</div>
                            <div className="university-location">
                              {application.university.city}, {application.university.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="subject-name">{application.subject}</div>
                      </td>
                      <td>
                        <span className="academic-year">{application.academicYear}</span>
                      </td>
                      <td>
                        <span className={`scholarship-badge ${application.applyingForScholarship ? 'yes' : 'no'}`}>
                          {application.applyingForScholarship ? '✅ Yes' : '❌ No'}
                        </span>
                      </td>
                      <td>
                        <div className="applied-date">
                          {new Date(application.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`application-status-badge status-${application.status}`}>
                          {application.status === 'pending' && '⏳ Pending'}
                          {application.status === 'accepted' && '✅ Accepted'}
                          {application.status === 'declined' && '❌ Declined'}
                          {application.status === 'under_review' && '👀 Under Review'}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/application-progress/${application._id}`}
                          className="progress-link"
                        >
                          📊 View Progress
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default DeadlineTracker;