import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const { user, getProfile, updateProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    currentCity: '',
    highestEducation: '',
    gpaOrCgpa: '',
    englishTest: '',
    englishScore: '',
    targetDegree: '',
    targetCountries: [],
    budgetMonthlyBDT: ''
  });

  const cities = [
    'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
  ];

  const countries = [
    'Canada', 'USA', 'UK', 'Australia', 'Germany', 'Netherlands', 'Sweden', 'Norway', 'Denmark'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        currentCity: profileData.currentCity || '',
        highestEducation: profileData.highestEducation || '',
        gpaOrCgpa: profileData.gpaOrCgpa || '',
        englishTest: profileData.englishTest || '',
        englishScore: profileData.englishScore || '',
        targetDegree: profileData.targetDegree || '',
        targetCountries: profileData.targetCountries || [],
        budgetMonthlyBDT: profileData.budgetMonthlyBDT || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCountryChange = (country) => {
    setFormData(prev => {
      const countries = prev.targetCountries.includes(country)
        ? prev.targetCountries.filter(c => c !== country)
        : prev.targetCountries.length < 3
        ? [...prev.targetCountries, country]
        : prev.targetCountries;
      
      return { ...prev, targetCountries: countries };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (formData.gpaOrCgpa && (isNaN(formData.gpaOrCgpa) || parseFloat(formData.gpaOrCgpa) < 0 || parseFloat(formData.gpaOrCgpa) > 5)) {
      newErrors.gpaOrCgpa = 'GPA/CGPA must be between 0 and 5';
    }
    
    if (formData.budgetMonthlyBDT && (isNaN(formData.budgetMonthlyBDT) || parseFloat(formData.budgetMonthlyBDT) < 0)) {
      newErrors.budgetMonthlyBDT = 'Budget must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await updateProfile({ ...formData, onboardingCompleted: true });
      toast.success('Profile updated successfully!');
      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div className="profile-edit-container">
      <div className="profile-edit-header">
        <h1>Edit Profile</h1>
        <p>Update your information to get better recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Current City</label>
            <select
              name="currentCity"
              value={formData.currentCity}
              onChange={handleInputChange}
            >
              <option value="">Select your city</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Academic Information */}
        <div className="form-section">
          <h2>Academic Background</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Highest Education</label>
              <select
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleInputChange}
              >
                <option value="">Select education level</option>
                <option value="HSC">HSC</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Masters">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>GPA/CGPA</label>
              <input
                type="number"
                name="gpaOrCgpa"
                value={formData.gpaOrCgpa}
                onChange={handleInputChange}
                placeholder="Enter your GPA/CGPA (0-5)"
                min="0"
                max="5"
                step="0.01"
                className={errors.gpaOrCgpa ? 'error' : ''}
              />
              {errors.gpaOrCgpa && <span className="error-message">{errors.gpaOrCgpa}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>English Test</label>
              <select
                name="englishTest"
                value={formData.englishTest}
                onChange={handleInputChange}
              >
                <option value="">Select test type</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEFL">TOEFL</option>
                <option value="PTE">PTE</option>
                <option value="None">None</option>
              </select>
            </div>
            
            {formData.englishTest && formData.englishTest !== 'None' && (
              <div className="form-group">
                <label>English Test Score</label>
                <input
                  type="text"
                  name="englishScore"
                  value={formData.englishScore}
                  onChange={handleInputChange}
                  placeholder="Enter your score"
                />
              </div>
            )}
          </div>
        </div>

        {/* Study Preferences */}
        <div className="form-section">
          <h2>Study Preferences</h2>
          
          <div className="form-group">
            <label>Target Degree</label>
            <select
              name="targetDegree"
              value={formData.targetDegree}
              onChange={handleInputChange}
            >
              <option value="">Select target degree</option>
              <option value="UG">Undergraduate</option>
              <option value="Masters">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Target Countries (Max 3)</label>
            <div className="country-grid">
              {countries.map(country => (
                <div
                  key={country}
                  className={`country-option ${
                    formData.targetCountries.includes(country) ? 'selected' : ''
                  } ${
                    !formData.targetCountries.includes(country) && formData.targetCountries.length >= 3 ? 'disabled' : ''
                  }`}
                  onClick={() => handleCountryChange(country)}
                >
                  {country}
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Monthly Budget (BDT)</label>
            <input
              type="number"
              name="budgetMonthlyBDT"
              value={formData.budgetMonthlyBDT}
              onChange={handleInputChange}
              placeholder="Enter your monthly budget"
              min="0"
              className={errors.budgetMonthlyBDT ? 'error' : ''}
            />
            {errors.budgetMonthlyBDT && <span className="error-message">{errors.budgetMonthlyBDT}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;