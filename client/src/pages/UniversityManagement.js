import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../components/AdminLayout.css';

const UniversityManagement = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    country: '',
    city: '',
    description: '',
    website: '',
    type: '',
    scholarships: [],
    admissionRequirements: {
      gpa: { min: '', max: '' },
      englishTests: [],
      standardizedTests: []
    },
    campusLife: {
      studentPopulation: '',
      internationalStudents: '',
      campusSize: '',
      accommodation: {
        available: false,
        cost: { min: '', max: '', currency: 'USD' }
      },
      partTimeJobOpportunities: {
        availability: 'Good',
        averageHourlyWage: { amount: '', currency: 'USD' },
        popularFields: [],
        workPermitInfo: {
          onCampusAllowed: true,
          offCampusAllowed: false,
          hoursPerWeek: 20,
          additionalInfo: ''
        },
        description: ''
      }
    }
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/universities');
      setUniversities(response.data.data || []);
    } catch (err) {
      console.error('Error fetching universities:', err);
      setError('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/universities', newUniversity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversities([...universities, response.data]);
      setNewUniversity({ 
        name: '', 
        country: '', 
        city: '', 
        description: '', 
        website: '', 
        type: '',
        scholarships: [],
        admissionRequirements: {
          gpa: { min: '', max: '' },
          englishTests: [],
          standardizedTests: []
        },
        campusLife: {
          studentPopulation: '',
          internationalStudents: '',
          campusSize: '',
          accommodation: {
            available: false,
            cost: { min: '', max: '', currency: 'USD' }
          },
          partTimeJobOpportunities: {
            availability: 'Good',
            averageHourlyWage: { amount: '', currency: 'USD' },
            popularFields: [],
            workPermitInfo: {
              onCampusAllowed: true,
              offCampusAllowed: false,
              hoursPerWeek: 20,
              additionalInfo: ''
            },
            description: ''
          }
        }
      });
      setShowCreateForm(false);
      alert('University created successfully');
    } catch (err) {
      console.error('Error creating university:', err);
      alert('Failed to create university');
    }
  };

  const handleUpdateUniversity = async (universityId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/universities/${universityId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversities(universities.map(uni => 
        uni._id === universityId ? response.data : uni
      ));
      setEditingUniversity(null);
      alert('University updated successfully');
    } catch (err) {
      console.error('Error updating university:', err);
      alert('Failed to update university');
    }
  };

  const handleDeactivateUniversity = async (universityId) => {
    if (!window.confirm('Are you sure you want to deactivate this university?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/universities/${universityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversities(universities.map(uni => 
        uni._id === universityId ? { ...uni, isActive: false } : uni
      ));
      alert('University deactivated successfully');
    } catch (err) {
      console.error('Error deactivating university:', err);
      alert('Failed to deactivate university');
    }
  };

  const filteredUniversities = universities.filter(uni => 
    (uni.name && uni.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (uni.country && uni.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (uni.city && uni.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading universities...</p>
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
            onClick={fetchUniversities}
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
        <h1 className="admin-card-title">University Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            ➕ Add University
          </button>
          <button 
            className="admin-btn admin-btn-secondary"
            onClick={fetchUniversities}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create University Form */}
      {showCreateForm && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Create New University</h2>
            <button 
              className="admin-btn admin-btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              ✕ Cancel
            </button>
          </div>
          
          <form onSubmit={handleCreateUniversity}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Name *</label>
                <input
                  type="text"
                  value={newUniversity.name}
                  onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Country *</label>
                <input
                  type="text"
                  value={newUniversity.country}
                  onChange={(e) => setNewUniversity({ ...newUniversity, country: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>City *</label>
                <input
                  type="text"
                  value={newUniversity.city}
                  onChange={(e) => setNewUniversity({ ...newUniversity, city: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Type *</label>
                <select
                  value={newUniversity.type}
                  onChange={(e) => setNewUniversity({ ...newUniversity, type: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="">Select Type</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Community">Community</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Website</label>
              <input
                type="url"
                value={newUniversity.website}
                onChange={(e) => setNewUniversity({ ...newUniversity, website: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description</label>
              <textarea
                value={newUniversity.description}
                onChange={(e) => setNewUniversity({ ...newUniversity, description: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>

            {/* Admission Requirements Section */}
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ marginBottom: '16px', color: '#333' }}>Admission Requirements</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Min GPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newUniversity.admissionRequirements.gpa.min}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      admissionRequirements: { 
                        ...newUniversity.admissionRequirements, 
                        gpa: { ...newUniversity.admissionRequirements.gpa, min: e.target.value }
                      }
                    })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Max GPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newUniversity.admissionRequirements.gpa.max}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      admissionRequirements: { 
                        ...newUniversity.admissionRequirements, 
                        gpa: { ...newUniversity.admissionRequirements.gpa, max: e.target.value }
                      }
                    })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Campus Life Section */}
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ marginBottom: '16px', color: '#333' }}>Campus Life</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Student Population</label>
                  <input
                    type="number"
                    value={newUniversity.campusLife.studentPopulation}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      campusLife: { ...newUniversity.campusLife, studentPopulation: e.target.value }
                    })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>International Students</label>
                  <input
                    type="number"
                    value={newUniversity.campusLife.internationalStudents}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      campusLife: { ...newUniversity.campusLife, internationalStudents: e.target.value }
                    })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Campus Size</label>
                <input
                  type="text"
                  value={newUniversity.campusLife.campusSize}
                  onChange={(e) => setNewUniversity({ 
                    ...newUniversity, 
                    campusLife: { ...newUniversity.campusLife, campusSize: e.target.value }
                  })}
                  placeholder="e.g., 200 acres, Large, Medium, Small"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newUniversity.campusLife.accommodation.available}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      campusLife: { 
                        ...newUniversity.campusLife, 
                        accommodation: { 
                          ...newUniversity.campusLife.accommodation, 
                          available: e.target.checked 
                        }
                      }
                    })}
                  />
                  <span style={{ fontWeight: '500' }}>Accommodation Available</span>
                </label>
              </div>
              
              {/* Part-Time Job Opportunities */}
              <div style={{ marginTop: '20px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#f5f5f5' }}>
                <h5 style={{ marginBottom: '12px', color: '#333' }}>Part-Time Job Opportunities</h5>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Availability</label>
                    <select
                      value={newUniversity.campusLife.partTimeJobOpportunities.availability}
                      onChange={(e) => setNewUniversity({ 
                        ...newUniversity, 
                        campusLife: { 
                          ...newUniversity.campusLife, 
                          partTimeJobOpportunities: {
                            ...newUniversity.campusLife.partTimeJobOpportunities,
                            availability: e.target.value
                          }
                        }
                      })}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Limited">Limited</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Average Hourly Wage</label>
                    <input
                      type="number"
                      value={newUniversity.campusLife.partTimeJobOpportunities.averageHourlyWage.amount}
                      onChange={(e) => setNewUniversity({ 
                        ...newUniversity, 
                        campusLife: { 
                          ...newUniversity.campusLife, 
                          partTimeJobOpportunities: {
                            ...newUniversity.campusLife.partTimeJobOpportunities,
                            averageHourlyWage: {
                              ...newUniversity.campusLife.partTimeJobOpportunities.averageHourlyWage,
                              amount: e.target.value
                            }
                          }
                        }
                      })}
                      placeholder="e.g., 15"
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo.onCampusAllowed}
                        onChange={(e) => setNewUniversity({ 
                          ...newUniversity, 
                          campusLife: { 
                            ...newUniversity.campusLife, 
                            partTimeJobOpportunities: {
                              ...newUniversity.campusLife.partTimeJobOpportunities,
                              workPermitInfo: {
                                ...newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo,
                                onCampusAllowed: e.target.checked
                              }
                            }
                          }
                        })}
                      />
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>On-Campus Work</span>
                    </label>
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo.offCampusAllowed}
                        onChange={(e) => setNewUniversity({ 
                          ...newUniversity, 
                          campusLife: { 
                            ...newUniversity.campusLife, 
                            partTimeJobOpportunities: {
                              ...newUniversity.campusLife.partTimeJobOpportunities,
                              workPermitInfo: {
                                ...newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo,
                                offCampusAllowed: e.target.checked
                              }
                            }
                          }
                        })}
                      />
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>Off-Campus Work</span>
                    </label>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>Hours/Week</label>
                    <input
                      type="number"
                      value={newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo.hoursPerWeek}
                      onChange={(e) => setNewUniversity({ 
                        ...newUniversity, 
                        campusLife: { 
                          ...newUniversity.campusLife, 
                          partTimeJobOpportunities: {
                            ...newUniversity.campusLife.partTimeJobOpportunities,
                            workPermitInfo: {
                              ...newUniversity.campusLife.partTimeJobOpportunities.workPermitInfo,
                              hoursPerWeek: e.target.value
                            }
                          }
                        }
                      })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description</label>
                  <textarea
                    value={newUniversity.campusLife.partTimeJobOpportunities.description}
                    onChange={(e) => setNewUniversity({ 
                      ...newUniversity, 
                      campusLife: { 
                        ...newUniversity.campusLife, 
                        partTimeJobOpportunities: {
                          ...newUniversity.campusLife.partTimeJobOpportunities,
                          description: e.target.value
                        }
                      }
                    })}
                    placeholder="Describe part-time job opportunities and general information..."
                    rows="3"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* External Scholarships Section */}
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ marginBottom: '16px', color: '#333' }}>External Scholarships</h4>
              <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                {newUniversity.scholarships.length === 0 
                  ? 'No scholarships available for this university at the moment.' 
                  : `${newUniversity.scholarships.length} scholarship(s) configured.`
                }
              </p>
              <button
                type="button"
                onClick={() => {
                  const newScholarship = { name: '', amount: '', currency: 'USD', criteria: '', deadline: '' };
                  setNewUniversity({ 
                    ...newUniversity, 
                    scholarships: [...newUniversity.scholarships, newScholarship]
                  });
                }}
                style={{ 
                  marginTop: '8px', 
                  padding: '6px 12px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add Scholarship
              </button>
              
              {newUniversity.scholarships.map((scholarship, index) => (
                <div key={index} style={{ marginTop: '12px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Scholarship Name"
                      value={scholarship.name}
                      onChange={(e) => {
                        const updatedScholarships = [...newUniversity.scholarships];
                        updatedScholarships[index].name = e.target.value;
                        setNewUniversity({ ...newUniversity, scholarships: updatedScholarships });
                      }}
                      style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={scholarship.amount}
                      onChange={(e) => {
                        const updatedScholarships = [...newUniversity.scholarships];
                        updatedScholarships[index].amount = e.target.value;
                        setNewUniversity({ ...newUniversity, scholarships: updatedScholarships });
                      }}
                      style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px' }}
                    />
                  </div>
                  <textarea
                    placeholder="Scholarship Criteria"
                    value={scholarship.criteria}
                    onChange={(e) => {
                      const updatedScholarships = [...newUniversity.scholarships];
                      updatedScholarships[index].criteria = e.target.value;
                      setNewUniversity({ ...newUniversity, scholarships: updatedScholarships });
                    }}
                    rows={2}
                    style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px', resize: 'vertical' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updatedScholarships = newUniversity.scholarships.filter((_, i) => i !== index);
                      setNewUniversity({ ...newUniversity, scholarships: updatedScholarships });
                    }}
                    style={{ 
                      marginTop: '6px', 
                      padding: '4px 8px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px', 
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            
            <button type="submit" className="admin-btn admin-btn-primary">
              Create University
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="admin-card">
        <input
          type="text"
          placeholder="Search universities by name or location..."
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
              {editingUniversity ? 'Editing mode active' : `${filteredUniversities.length} universities found`}
            </span>
            {editingUniversity && (
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingUniversity(null)}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Universities Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Universities ({filteredUniversities.length})</h2>
        </div>
        
        {filteredUniversities.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Type</th>
                <th>Website</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniversities.map((university) => (
                <tr key={university._id}>
                  <td>
                    {editingUniversity === university._id ? (
                      <input
                        type="text"
                        defaultValue={university.name}
                        id={`name-${university._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '150px' }}
                      />
                    ) : (
                      university.name
                    )}
                  </td>
                  <td>
                    {editingUniversity === university._id ? (
                      <input
                        type="text"
                        defaultValue={university.location}
                        id={`location-${university._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '120px' }}
                      />
                    ) : (
                      university.location
                    )}
                  </td>
                  <td>
                    {editingUniversity === university._id ? (
                      <select
                        defaultValue={university.type}
                        id={`type-${university._id}`}
                        style={{ padding: '4px', fontSize: '12px' }}
                      >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                        <option value="Community">Community</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${
                        university.type === 'public' ? 'status-active' : 'status-inactive'
                      }`}>
                        {university.type}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingUniversity === university._id ? (
                      <input
                        type="url"
                        defaultValue={university.website}
                        id={`website-${university._id}`}
                        style={{ padding: '4px', fontSize: '12px', width: '150px' }}
                      />
                    ) : (
                      university.website ? (
                        <a href={university.website} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                          🌐 Visit
                        </a>
                      ) : (
                        '-'
                      )
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      university.isActive !== false ? 'status-active' : 'status-inactive'
                    }`}>
                      {university.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingUniversity === university._id ? (
                        <>
                          <button
                            className="action-btn action-btn-save"
                            onClick={() => {
                              const name = document.getElementById(`name-${university._id}`).value;
                              const location = document.getElementById(`location-${university._id}`).value;
                              const type = document.getElementById(`type-${university._id}`).value;
                              const website = document.getElementById(`website-${university._id}`).value;
                              handleUpdateUniversity(university._id, { name, location, type, website });
                            }}
                            title="Save changes"
                          >
                            ✓
                          </button>
                          <button
                            className="action-btn action-btn-cancel"
                            onClick={() => setEditingUniversity(null)}
                            title="Cancel editing"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => setEditingUniversity(university._id)}
                            title="Edit university"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeactivateUniversity(university._id)}
                            title="Delete university"
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
            <p>No universities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityManagement;