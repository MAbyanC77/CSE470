import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/AdminLayout.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUniversities: 0,
    totalScholarships: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user stats
      const userStatsResponse = await axios.get('/api/users/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch university stats
      const universityStatsResponse = await axios.get('/api/universities/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch scholarships (we'll count them)
      const scholarshipsResponse = await axios.get('/api/scholarships', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        totalUsers: userStatsResponse.data.stats.totalUsers || 0,
        totalUniversities: universityStatsResponse.data.stats.total || 0,
        totalScholarships: (scholarshipsResponse.data.scholarships || []).length || 0,
        recentUsers: userStatsResponse.data.stats.recentUsers || []
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading dashboard data...</p>
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
            onClick={fetchDashboardData}
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
        <h1 className="admin-card-title">Admin Dashboard</h1>
        <button 
          className="admin-btn admin-btn-secondary"
          onClick={fetchDashboardData}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalUniversities}</div>
          <div className="stat-label">Universities</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.totalScholarships}</div>
          <div className="stat-label">Scholarships</div>
        </div>
        
        <div className="stat-card">
          <span className="stat-icon">📈</span>
          <div className="stat-number">{stats.recentUsers.length}</div>
          <div className="stat-label">Recent Users</div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Users</h2>
          <a href="/admin/users" className="admin-btn admin-btn-primary">
            View All Users
          </a>
        </div>
        
        {stats.recentUsers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${
                      user.role === 'admin' ? 'status-active' : 'status-inactive'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${
                      user.isActive ? 'status-active' : 'status-inactive'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Quick Actions</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <a href="/admin/users" className="admin-btn admin-btn-primary">
            👥 Manage Users
          </a>
          <a href="/admin/universities" className="admin-btn admin-btn-primary">
            🏛️ Manage Universities
          </a>
          <a href="/admin/scholarships" className="admin-btn admin-btn-primary">
            🎓 Manage Scholarships
          </a>
          <a href="/admin/applications" className="admin-btn admin-btn-primary">
            📋 Manage Applications
          </a>
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={() => window.open('/', '_blank')}
          >
            🌐 View Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;