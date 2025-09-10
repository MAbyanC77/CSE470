import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/AdminLayout.css';

const ScholarshipManagement = () => {
  const [scholarships, setScholarships] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newScholarship, setNewScholarship] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
    eligibilityCriteria: '',
    applicationLink: '',
    university: ''
  });

  useEffect(() => {
    fetchScholarships();
    fetchUniversities();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/scholarships');
      setScholarships(response.data.scholarships || []);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/universities');
      setUniversities(response.data.data || []);
    } catch (err) {
      console.error('Error fetching universities:', err);
    }
  };

  const handleCreateScholarship = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/scholarships', newScholarship, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScholarships([...scholarships, response.data]);
      setNewScholarship({
        title: '',
        description: '',
        amount: '',
        deadline: '',
        eligibilityCriteria: '',
        applicationLink: '',
        university: ''
      });
      setShowCreateForm(false);
      alert('Scholarship created successfully');
    } catch (err) {
      console.error('Error creating scholarship:', err);
      alert('Failed to create scholarship');
    }
  };

  const handleUpdateScholarship = async (scholarshipId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/scholarships/${scholarshipId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScholarships(scholarships.map(scholarship => 
        scholarship._id === scholarshipId ? response.data : scholarship
      ));
      setEditingScholarship(null);
      alert('Scholarship updated successfully');
    } catch (err) {
      console.error('Error updating scholarship:', err);
      alert('Failed to update scholarship');
    }
  };

  const handleDeleteScholarship = async (scholarshipId) => {
    if (!window.confirm('Are you sure you want to delete this scholarship?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/scholarships/${scholarshipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScholarships(scholarships.filter(scholarship => scholarship._id !== scholarshipId));
      alert('Scholarship deleted successfully');
    } catch (err) {
      console.error('Error deleting scholarship:', err);
      alert('Failed to delete scholarship');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredScholarships = scholarships.filter(scholarship => 
    (scholarship.title && scholarship.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (scholarship.university && scholarship.university.name && 
     scholarship.university.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading scholarships...</p>
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
            onClick={fetchScholarships}
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
        <h1 className="admin-card-title">Scholarship Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            ➕ Add Scholarship
          </button>
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={fetchScholarships}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create Scholarship Form */}
      {showCreateForm && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Create New Scholarship</h2>
            <button 
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              ✕ Cancel
            </button>
          </div>
          
          <form onSubmit={handleCreateScholarship}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Title *</label>
                <input
                  type="text"
                  value={newScholarship.title}
                  onChange={(e) => setNewScholarship({ ...newScholarship, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>University</label>
                <select
                  value={newScholarship.university}
                  onChange={(e) => setNewScholarship({ ...newScholarship, university: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">Select University (Optional)</option>
                  {universities.map(uni => (
                    <option key={uni._id} value={uni._id}>{uni.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Amount ($) *</label>
                <input
                  type="number"
                  value={newScholarship.amount}
                  onChange={(e) => setNewScholarship({ ...newScholarship, amount: e.target.value })}
                  required
                  min="0"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Deadline *</label>
                <input
                  type="date"
                  value={newScholarship.deadline}
                  onChange={(e) => setNewScholarship({ ...newScholarship, deadline: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Application Link</label>
              <input
                type="url"
                value={newScholarship.applicationLink}
                onChange={(e) => setNewScholarship({ ...newScholarship, applicationLink: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description *</label>
              <textarea
                value={newScholarship.description}
                onChange={(e) => setNewScholarship({ ...newScholarship, description: e.target.value })}
                required
                rows={3}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Eligibility Criteria</label>
              <textarea
                value={newScholarship.eligibilityCriteria}
                onChange={(e) => setNewScholarship({ ...newScholarship, eligibilityCriteria: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            
            <button type="submit" className="admin-btn admin-btn-primary">
              Create Scholarship
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="admin-card">
        <input
          type="text"
          placeholder="Search scholarships by title or university..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Action Bar */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6c757d' }}>
              {editingScholarship ? 'Editing mode active' : `${filteredScholarships.length} scholarships found`}
            </span>
            {editingScholarship && (
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingScholarship(null)}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scholarships Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Scholarships ({filteredScholarships.length})</h2>
        </div>
        
        {filteredScholarships.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>University</th>
                <th>Amount</th>
                <th>Deadline</th>
                <th>Application Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScholarships.map((scholarship) => (
                <tr key={scholarship._id}>
                  <td>
                    {editingScholarship === scholarship._id ? (
                      <input
                        type="text"
                        defaultValue={scholarship.title}
                        id={`title-${scholarship._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '150px' }}
                      />
                    ) : (
                      <div>
                        <div style={{ fontWeight: '500' }}>{scholarship.title}</div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                          {scholarship.description && scholarship.description.substring(0, 100)}...
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingScholarship === scholarship._id ? (
                      <select
                        defaultValue={scholarship.university?._id || ''}
                        id={`university-${scholarship._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '120px' }}
                      >
                        <option value="">No University</option>
                        {universities.map(uni => (
                          <option key={uni._id} value={uni._id}>{uni.name}</option>
                        ))}
                      </select>
                    ) : (
                      scholarship.university ? scholarship.university.name : 'General'
                    )}
                  </td>
                  <td>
                    {editingScholarship === scholarship._id ? (
                      <input
                        type="number"
                        defaultValue={scholarship.amount}
                        id={`amount-${scholarship._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '100px' }}
                      />
                    ) : (
                      formatCurrency(scholarship.amount)
                    )}
                  </td>
                  <td>
                    {editingScholarship === scholarship._id ? (
                      <input
                        type="date"
                        defaultValue={scholarship.deadline ? scholarship.deadline.split('T')[0] : ''}
                        id={`deadline-${scholarship._id}`}
                        style={{ padding: '4px', fontSize: '12px' }}
                      />
                    ) : (
                      <div>
                        <div>{formatDate(scholarship.deadline)}</div>
                        <div style={{ fontSize: '12px', color: new Date(scholarship.deadline) < new Date() ? '#dc3545' : '#28a745' }}>
                          {new Date(scholarship.deadline) < new Date() ? 'Expired' : 'Active'}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingScholarship === scholarship._id ? (
                      <input
                        type="url"
                        defaultValue={scholarship.applicationLink}
                        id={`applicationLink-${scholarship._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '120px' }}
                      />
                    ) : (
                      scholarship.applicationLink ? (
                        <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                          🔗 Apply
                        </a>
                      ) : (
                        '-'
                      )
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingScholarship === scholarship._id ? (
                        <>
                          <button
                            className="action-btn action-btn-save"
                            onClick={() => {
                              const title = document.getElementById(`title-${scholarship._id}`).value;
                              const university = document.getElementById(`university-${scholarship._id}`).value;
                              const amount = document.getElementById(`amount-${scholarship._id}`).value;
                              const deadline = document.getElementById(`deadline-${scholarship._id}`).value;
                              const applicationLink = document.getElementById(`applicationLink-${scholarship._id}`).value;
                              handleUpdateScholarship(scholarship._id, { 
                                title, 
                                university: university || null, 
                                amount, 
                                deadline, 
                                applicationLink 
                              });
                            }}
                            title="Save changes"
                          >
                            ✓
                          </button>
                          <button
                            className="action-btn action-btn-cancel"
                            onClick={() => setEditingScholarship(null)}
                            title="Cancel editing"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => setEditingScholarship(scholarship._id)}
                            title="Edit scholarship"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteScholarship(scholarship._id)}
                            title="Delete scholarship"
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
            <p>No scholarships found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipManagement;