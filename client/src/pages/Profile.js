import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, uploadDocuments, downloadDocument, deleteDocument, loading } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
    address: {
      street: user?.profile?.address?.street || '',
      city: user?.profile?.address?.city || '',
      state: user?.profile?.address?.state || '',
      country: user?.profile?.address?.country || '',
      zipCode: user?.profile?.address?.zipCode || ''
    },
    education: {
      level: user?.profile?.education?.level || '',
      institution: user?.profile?.education?.institution || '',
      fieldOfStudy: user?.profile?.education?.fieldOfStudy || '',
      graduationYear: user?.profile?.education?.graduationYear || ''
    },
    preferences: {
      preferredCountries: user?.profile?.preferences?.preferredCountries || [],
      preferredPrograms: user?.profile?.preferences?.preferredPrograms || [],
      budgetRange: user?.profile?.preferences?.budgetRange || ''
    }
  });
  const [errors, setErrors] = useState({});
  // Text-based document information instead of file uploads
  const [documentInfo, setDocumentInfo] = useState({
    ieltsScore: '',
    toeflScore: '',
    greScore: '',
    satScore: '',
    passport: '',
    nationalId: '',
    photograph: '',
    bankStatements: '',
    sponsorshipLetter: '',
    taxReturns: '',
    statementOfPurpose: '',
    personalStatement: '',
    cv: '',
    recommendationLetters: '',
    researchProposal: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: array
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.profile?.phone || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
      address: {
        street: user?.profile?.address?.street || '',
        city: user?.profile?.address?.city || '',
        state: user?.profile?.address?.state || '',
        country: user?.profile?.address?.country || '',
        zipCode: user?.profile?.address?.zipCode || ''
      },
      education: {
        level: user?.profile?.education?.level || '',
        institution: user?.profile?.education?.institution || '',
        fieldOfStudy: user?.profile?.education?.fieldOfStudy || '',
        graduationYear: user?.profile?.education?.graduationYear || ''
      },
      preferences: {
        preferredCountries: user?.profile?.preferences?.preferredCountries || [],
        preferredPrograms: user?.profile?.preferences?.preferredPrograms || [],
        budgetRange: user?.profile?.preferences?.budgetRange || ''
      }
    });
    setErrors({});
    setIsEditing(false);
  };

  // Document handling functions
  const handleDocumentInfoChange = (field, value) => {
    setDocumentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // Removed file upload functionality - now using text inputs only

  // File handling functions removed - now using text inputs only

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="profile-info">
              <h1>{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <span className={`role-badge ${user?.role}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-form">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+880 1234 567890"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h2>Address Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address.street">Street Address</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="House/Flat No, Road, Area"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Dhaka"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.state">State/Division</label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Dhaka Division"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.country">Country</label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Bangladesh"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address.zipCode">ZIP/Postal Code</label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Education Information */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>Education Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="education.level">Education Level</label>
                  <select
                    id="education.level"
                    name="education.level"
                    value={formData.education.level}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Level</option>
                    <option value="high_school">High School</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="education.institution">Institution</label>
                  <input
                    type="text"
                    id="education.institution"
                    name="education.institution"
                    value={formData.education.institution}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="University of Dhaka"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="education.fieldOfStudy">Field of Study</label>
                  <input
                    type="text"
                    id="education.fieldOfStudy"
                    name="education.fieldOfStudy"
                    value={formData.education.fieldOfStudy}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="education.graduationYear">Graduation Year</label>
                  <input
                    type="number"
                    id="education.graduationYear"
                    name="education.graduationYear"
                    value={formData.education.graduationYear}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    min="1990"
                    max="2030"
                    placeholder="2024"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preferences (Student Only) */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>Study Abroad Preferences</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="preferredCountries">Preferred Countries</label>
                  <input
                    type="text"
                    id="preferredCountries"
                    value={formData.preferences.preferredCountries.join(', ')}
                    onChange={(e) => handleArrayChange('preferredCountries', e.target.value)}
                    disabled={!isEditing}
                    placeholder="USA, Canada, UK, Australia (comma separated)"
                  />
                  <small>Enter countries separated by commas</small>
                </div>

                <div className="form-group">
                  <label htmlFor="preferredPrograms">Preferred Programs</label>
                  <input
                    type="text"
                    id="preferredPrograms"
                    value={formData.preferences.preferredPrograms.join(', ')}
                    onChange={(e) => handleArrayChange('preferredPrograms', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Computer Science, Engineering, Business (comma separated)"
                  />
                  <small>Enter programs separated by commas</small>
                </div>

                <div className="form-group">
                  <label htmlFor="preferences.budgetRange">Budget Range (USD)</label>
                  <select
                    id="preferences.budgetRange"
                    name="preferences.budgetRange"
                    value={formData.preferences.budgetRange}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Budget Range</option>
                    <option value="under_20k">Under $20,000</option>
                    <option value="20k_40k">$20,000 - $40,000</option>
                    <option value="40k_60k">$40,000 - $60,000</option>
                    <option value="60k_80k">$60,000 - $80,000</option>
                    <option value="above_80k">Above $80,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>📚 Academic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="oLevelResults">O-Level Results Summary</label>
                  <textarea
                    id="oLevelResults"
                    name="oLevelResults"
                    value={documentInfo.oLevelResults}
                    onChange={(e) => handleDocumentInfoChange('oLevelResults', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your O-Level results summary (e.g., Mathematics: A, English: B, etc.)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aLevelResults">A-Level Results Summary</label>
                  <textarea
                    id="aLevelResults"
                    name="aLevelResults"
                    value={documentInfo.aLevelResults}
                    onChange={(e) => handleDocumentInfoChange('aLevelResults', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your A-Level results summary (e.g., Physics: A*, Chemistry: A, etc.)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bachelorTranscript">Bachelor's Degree Information</label>
                  <textarea
                    id="bachelorTranscript"
                    name="bachelorTranscript"
                    value={documentInfo.bachelorTranscript}
                    onChange={(e) => handleDocumentInfoChange('bachelorTranscript', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your bachelor's degree details (e.g., CGPA: 3.8/4.0, Major: Computer Science, etc.)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="masterTranscript">Master's Degree Information</label>
                  <textarea
                    id="masterTranscript"
                    name="masterTranscript"
                    value={documentInfo.masterTranscript}
                    onChange={(e) => handleDocumentInfoChange('masterTranscript', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your master's degree details (if applicable)"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Scores */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>📊 Test Scores</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="ieltsScore">IELTS Score Details</label>
                  <textarea
                    id="ieltsScore"
                    name="ieltsScore"
                    value={documentInfo.ieltsScore}
                    onChange={(e) => handleDocumentInfoChange('ieltsScore', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your IELTS score details (e.g., Overall: 7.5, Reading: 8.0, Writing: 7.0, etc.)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="toeflScore">TOEFL Score Details</label>
                  <textarea
                    id="toeflScore"
                    name="toeflScore"
                    value={documentInfo.toeflScore}
                    onChange={(e) => handleDocumentInfoChange('toeflScore', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your TOEFL score details (e.g., Total: 105, Reading: 28, Writing: 25, etc.)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="greScore">GRE Score Details</label>
                  <textarea
                    id="greScore"
                    name="greScore"
                    value={documentInfo.greScore}
                    onChange={(e) => handleDocumentInfoChange('greScore', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your GRE score details (e.g., Quantitative: 165, Verbal: 160, AWA: 4.5)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="satScore">SAT Score Details</label>
                  <textarea
                    id="satScore"
                    name="satScore"
                    value={documentInfo.satScore}
                    onChange={(e) => handleDocumentInfoChange('satScore', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your SAT score details (e.g., Total: 1450, Math: 750, Reading: 700)"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>🆔 Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="passport">Passport Information</label>
                  <textarea
                    id="passport"
                    name="passport"
                    value={documentInfo.passport}
                    onChange={(e) => handleDocumentInfoChange('passport', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your passport details (e.g., Passport Number: A1234567, Expiry Date: 2030-12-31, Country: USA)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nationalId">National ID Information</label>
                  <textarea
                    id="nationalId"
                    name="nationalId"
                    value={documentInfo.nationalId}
                    onChange={(e) => handleDocumentInfoChange('nationalId', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your national ID details (e.g., ID Number: 123456789, Issue Date: 2020-01-01)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="photograph">Photograph Description</label>
                  <textarea
                    id="photograph"
                    name="photograph"
                    value={documentInfo.photograph}
                    onChange={(e) => handleDocumentInfoChange('photograph', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Describe your passport-size photograph (e.g., Professional headshot, formal attire, white background)"
                    rows="2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Information */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>💰 Financial Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bankStatements">Bank Statement Summary</label>
                  <textarea
                    id="bankStatements"
                    name="bankStatements"
                    value={documentInfo.bankStatements}
                    onChange={(e) => handleDocumentInfoChange('bankStatements', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your bank statement summary (e.g., Account balance: $50,000, Monthly income: $5,000)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sponsorshipLetter">Sponsorship Information</label>
                  <textarea
                    id="sponsorshipLetter"
                    name="sponsorshipLetter"
                    value={documentInfo.sponsorshipLetter}
                    onChange={(e) => handleDocumentInfoChange('sponsorshipLetter', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter sponsorship details (e.g., Sponsor: John Doe, Relationship: Father, Amount: $30,000)"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taxReturns">Tax Return Summary</label>
                  <textarea
                    id="taxReturns"
                    name="taxReturns"
                    value={documentInfo.taxReturns}
                    onChange={(e) => handleDocumentInfoChange('taxReturns', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter tax return summary (e.g., Annual income: $80,000, Tax year: 2023)"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Application Information */}
          {user?.role === 'student' && (
            <div className="form-section">
              <h2>📝 Application Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="statementOfPurpose">Statement of Purpose (SOP)</label>
                  <textarea
                    id="statementOfPurpose"
                    name="statementOfPurpose"
                    value={documentInfo.statementOfPurpose}
                    onChange={(e) => handleDocumentInfoChange('statementOfPurpose', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your statement of purpose summary or key points"
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="personalStatement">Personal Statement</label>
                  <textarea
                    id="personalStatement"
                    name="personalStatement"
                    value={documentInfo.personalStatement}
                    onChange={(e) => handleDocumentInfoChange('personalStatement', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your personal statement summary or key points"
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cv">CV/Resume Summary</label>
                  <textarea
                    id="cv"
                    name="cv"
                    value={documentInfo.cv}
                    onChange={(e) => handleDocumentInfoChange('cv', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your professional experience, skills, and achievements"
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recommendationLetters">Recommendation Letters</label>
                  <textarea
                    id="recommendationLetters"
                    name="recommendationLetters"
                    value={documentInfo.recommendationLetters}
                    onChange={(e) => handleDocumentInfoChange('recommendationLetters', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter details about your recommendation letters, recommenders, and key highlights"
                    rows="5"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="researchProposal">Research Proposal Summary</label>
                  <textarea
                    id="researchProposal"
                    name="researchProposal"
                    value={documentInfo.researchProposal}
                    onChange={(e) => handleDocumentInfoChange('researchProposal', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your research proposal summary, objectives, and methodology"
                    rows="5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="form-section">
            <h2>Account Information</h2>
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Account Status:</span>
                <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login:</span>
                <span>
                  {user?.lastLogin 
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;