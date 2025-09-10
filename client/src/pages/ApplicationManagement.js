import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/AdminLayout.css';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingApplication, setEditingApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [universities, setUniversities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusNote, setStatusNote] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107' },
    { value: 'under_review', label: 'Under Review', color: '#17a2b8' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: '#6f42c1' },
    { value: 'interview_completed', label: 'Interview Completed', color: '#fd7e14' },
    { value: 'waitlisted', label: 'Waitlisted', color: '#6c757d' },
    { value: 'accepted', label: 'Accepted', color: '#28a745' },
    { value: 'declined', label: 'Declined', color: '#dc3545' },
    { value: 'withdrawn', label: 'Withdrawn', color: '#6c757d' }
  ];

  useEffect(() => {
    fetchApplications();
    fetchUniversities();
  }, [currentPage, filterStatus, filterUniversity]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterUniversity !== 'all') params.append('university', filterUniversity);
      
      const response = await axios.get(`/api/applications/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplications(response.data.applications);
      setTotalPages(response.data.totalPages);
      setError('');
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/universities');
      setUniversities(response.data.universities || []);
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/applications/admin/${applicationId}/status`, {
        status: newStatus,
        note: statusNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingApplication(null);
      setStatusNote('');
      fetchApplications();
      alert('Application status updated successfully!');
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: statusConfig?.color + '20',
          color: statusConfig?.color,
          border: `1px solid ${statusConfig?.color}40`
        }}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>❌</div>
          <p>{error}</p>
          <button 
            className="admin-btn admin-btn-primary" 
            onClick={fetchApplications}
            style={{ marginTop: '16px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-card-header">
        <h1 className="admin-card-title">Application Management</h1>
        <button 
          className="admin-btn admin-btn-secondary"
          onClick={fetchApplications}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Filters & Search</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by student name, email, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={filterUniversity}
            onChange={(e) => {
              setFilterUniversity(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Universities</option>
            {universities.map(university => (
              <option key={university._id} value={university._id}>
                {university.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Applications ({filteredApplications.length})</h2>
          {editingApplication && (
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setEditingApplication(null);
                setStatusNote('');
              }}
            >
              ✕ Cancel Edit
            </button>
          )}
        </div>
        
        {filteredApplications.length > 0 ? (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>University</th>
                  <th>Program</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {application.user?.name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {application.user?.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {application.university?.name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {application.university?.city}, {application.university?.country}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div>{application.subject || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {application.semester} {application.academicYear}
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      {editingApplication === application._id ? (
                        <div style={{ minWidth: '200px' }}>
                          <select
                            value={application.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setApplications(prev => prev.map(app => 
                                app._id === application._id 
                                  ? { ...app, status: newStatus }
                                  : app
                              ));
                            }}
                            style={{
                              padding: '6px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '12px',
                              width: '100%',
                              marginBottom: '8px'
                            }}
                          >
                            {statusOptions.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            placeholder="Add a note (optional)..."
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '12px',
                              resize: 'vertical',
                              minHeight: '60px'
                            }}
                          />
                        </div>
                      ) : (
                        getStatusBadge(application.status)
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingApplication === application._id ? (
                          <>
                            <button
                              className="action-btn action-btn-save"
                              onClick={() => updateApplicationStatus(application._id, application.status)}
                              title="Save Changes"
                            >
                              ✓
                            </button>
                            <button
                              className="action-btn action-btn-cancel"
                              onClick={() => {
                                setEditingApplication(null);
                                setStatusNote('');
                                fetchApplications(); // Reset changes
                              }}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => setEditingApplication(application._id)}
                            title="Edit Status"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '12px', 
                marginTop: '24px',
                padding: '16px'
              }}>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  ← Previous
                </button>
                
                <span style={{ color: '#6c757d', fontSize: '14px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p>No applications found</p>
            {(filterStatus !== 'all' || filterUniversity !== 'all' || searchTerm) && (
              <button 
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterUniversity('all');
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                style={{ marginTop: '12px' }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Statistics */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Status Overview</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {statusOptions.map(status => {
            const count = applications.filter(app => app.status === status.value).length;
            return (
              <div 
                key={status.value}
                style={{
                  padding: '16px',
                  border: `2px solid ${status.color}40`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor: `${status.color}10`
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: status.color }}>
                  {count}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationManagement;