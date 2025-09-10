import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ApplicationForm.css';

const ApplicationForm = () => {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    semester: '',
    subject: '',
    applyingForScholarship: false,
    scholarshipType: '',
    personalStatement: '',
    additionalDocuments: '',
    preferredStartDate: '',
    academicYear: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUniversityDetails();
  }, [universityId, isAuthenticated, navigate]);

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/universities/${universityId}`);
      if (response.data.success) {
        setUniversity(response.data.university);
      } else {
        setError('University not found');
      }
    } catch (error) {
      console.error('Error fetching university details:', error);
      setError('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.semester.trim()) {
      errors.semester = 'Semester is required';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject/Program is required';
    }
    
    if (!formData.preferredStartDate) {
      errors.preferredStartDate = 'Preferred start date is required';
    }
    
    if (!formData.academicYear.trim()) {
      errors.academicYear = 'Academic year is required';
    }
    
    if (formData.applyingForScholarship && !formData.scholarshipType.trim()) {
      errors.scholarshipType = 'Scholarship type is required when applying for scholarship';
    }
    
    if (!formData.personalStatement.trim()) {
      errors.personalStatement = 'Personal statement is required';
    } else if (formData.personalStatement.length < 100) {
      errors.personalStatement = 'Personal statement must be at least 100 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const applicationData = {
        university: universityId,
        semester: formData.semester,
        academicYear: formData.academicYear,
        subject: formData.subject,
        preferredStartDate: formData.preferredStartDate,
        applyingForScholarship: formData.applyingForScholarship,
        personalStatement: formData.personalStatement,
        additionalDocuments: formData.additionalDocuments
      };

      // Only include scholarshipType if applying for scholarship
      if (formData.applyingForScholarship && formData.scholarshipType) {
        applicationData.scholarshipType = formData.scholarshipType;
      }
      
      const response = await axios.post('/api/applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/universities/${universityId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="application-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading application form...</p>
      </div>
    );
  }

  if (error && !university) {
    return (
      <div className="application-form-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/universities')} className="btn-back">
          ← Back to Universities
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="application-success">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h2>Application Submitted Successfully!</h2>
          <p>Your application to {university?.name} has been submitted.</p>
          <p>You will be redirected back to the university details page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="application-form">
      <div className="application-form-container">
        <div className="application-header">
          <button onClick={() => navigate(`/universities/${universityId}`)} className="btn-back">
            ← Back to University
          </button>
          
          <div className="university-info">
            <h1>Apply to {university?.name}</h1>
            <p className="university-location">
              📍 {university?.city}, {university?.country}
            </p>
          </div>
        </div>

        <div className="application-content">
          <div className="user-info-section">
            <h3>Your Information</h3>
            <div className="user-info">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p className="info-note">
                💡 Your profile information will be automatically included with your application.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="application-form-content">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-section">
              <h3>Application Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={formErrors.semester ? 'error' : ''}
                  >
                    <option value="">Select Semester</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                  {formErrors.semester && <span className="error-text">{formErrors.semester}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="academicYear">Academic Year *</label>
                  <select
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={formErrors.academicYear ? 'error' : ''}
                  >
                    <option value="">Select Academic Year</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                  {formErrors.academicYear && <span className="error-text">{formErrors.academicYear}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject/Program *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science, Business Administration, Engineering"
                  className={formErrors.subject ? 'error' : ''}
                />
                {formErrors.subject && <span className="error-text">{formErrors.subject}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="preferredStartDate">Preferred Start Date *</label>
                <input
                  type="date"
                  id="preferredStartDate"
                  name="preferredStartDate"
                  value={formData.preferredStartDate}
                  onChange={handleChange}
                  className={formErrors.preferredStartDate ? 'error' : ''}
                />
                {formErrors.preferredStartDate && <span className="error-text">{formErrors.preferredStartDate}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Scholarship Information</h3>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="applyingForScholarship"
                    checked={formData.applyingForScholarship}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  I am applying for a scholarship
                </label>
              </div>

              {formData.applyingForScholarship && (
                <div className="form-group">
                  <label htmlFor="scholarshipType">Scholarship Type *</label>
                  <select
                    id="scholarshipType"
                    name="scholarshipType"
                    value={formData.scholarshipType}
                    onChange={handleChange}
                    className={formErrors.scholarshipType ? 'error' : ''}
                  >
                    <option value="">Select Scholarship Type</option>
                    <option value="Merit-based">Merit-based</option>
                    <option value="Need-based">Need-based</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Academic Excellence">Academic Excellence</option>
                    <option value="Research">Research</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.scholarshipType && <span className="error-text">{formErrors.scholarshipType}</span>}
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Personal Statement</h3>
              
              <div className="form-group">
                <label htmlFor="personalStatement">Personal Statement *</label>
                <textarea
                  id="personalStatement"
                  name="personalStatement"
                  value={formData.personalStatement}
                  onChange={handleChange}
                  placeholder="Tell us why you want to study at this university and in your chosen program. Minimum 100 characters."
                  rows={6}
                  className={formErrors.personalStatement ? 'error' : ''}
                />
                <div className="character-count">
                  {formData.personalStatement.length} characters
                </div>
                {formErrors.personalStatement && <span className="error-text">{formErrors.personalStatement}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="additionalDocuments">Additional Information</label>
                <textarea
                  id="additionalDocuments"
                  name="additionalDocuments"
                  value={formData.additionalDocuments}
                  onChange={handleChange}
                  placeholder="Any additional information you'd like to include (optional)"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate(`/universities/${universityId}`)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-submit"
              >
                {submitting ? '⏳ Submitting...' : '📝 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;