import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/AdminLayout.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user._id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/users/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(user => 
        user._id === userId ? response.data : user
      ));
      setEditingUser(null);
      alert('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading users...</p>
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
            onClick={fetchUsers}
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
        <h1 className="admin-card-title">User Management</h1>
        <button 
          className="admin-btn admin-btn-secondary"
          onClick={fetchUsers}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search users by name or email..."
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
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Action Bar */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {editingUser ? 'Editing mode active' : `${filteredUsers.length} users found`}
            </span>
            {editingUser && (
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingUser(null)}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Users ({filteredUsers.length})</h2>
        </div>
        
        {filteredUsers.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    {editingUser === user._id ? (
                      <input
                        type="text"
                        defaultValue={user.name}
                        id={`name-${user._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '160px' }}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingUser === user._id ? (
                      <input
                        type="email"
                        defaultValue={user.email}
                        id={`email-${user._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '150px' }}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUser === user._id ? (
                      <select
                        defaultValue={user.role}
                        id={`role-${user._id}`}
                        style={{ padding: '4px', fontSize: '12px' }}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${
                        user.role === 'admin' ? 'status-active' : 'status-inactive'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${
                      user.isActive ? 'status-active' : 'status-inactive'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingUser === user._id ? (
                        <>
                          <button
                            className="action-btn action-btn-save"
                            onClick={() => {
                              const name = document.getElementById(`name-${user._id}`).value;
                              const email = document.getElementById(`email-${user._id}`).value;
                              const role = document.getElementById(`role-${user._id}`).value;
                              handleUpdateUser(user._id, { name, email, role });
                            }}
                            title="Save changes"
                          >
                            ✓
                          </button>
                          <button
                            className="action-btn action-btn-cancel"
                            onClick={() => setEditingUser(null)}
                            title="Cancel editing"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => setEditingUser(user._id)}
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
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
    </div>
  );
};

export default UserManagement;