import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './OnboardingWizard.css';

const OnboardingWizard = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
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

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.currentCity) newErrors.currentCity = 'Current city is required';
      if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }
    
    if (step === 2) {
      if (formData.gpaOrCgpa && (isNaN(formData.gpaOrCgpa) || parseFloat(formData.gpaOrCgpa) < 0 || parseFloat(formData.gpaOrCgpa) > 5)) {
        newErrors.gpaOrCgpa = 'GPA/CGPA must be between 0 and 5';
      }
    }
    
    if (step === 3) {
      if (!formData.targetDegree) newErrors.targetDegree = 'Target degree is required';
      if (formData.budgetMonthlyBDT && (isNaN(formData.budgetMonthlyBDT) || parseFloat(formData.budgetMonthlyBDT) < 0)) {
        newErrors.budgetMonthlyBDT = 'Budget must be a positive number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await updateProfile({ ...formData, onboardingCompleted: false });
      navigate('/profile');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!validateStep(3)) return;
    
    try {
      setLoading(true);
      await updateProfile({ ...formData, onboardingCompleted: true });
      navigate('/profile', { state: { showWelcome: true } });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Saving your profile..." />;
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <h1>Welcome to EduGlobalBd!</h1>
          <p>Let's set up your profile to get personalized recommendations</p>
          <div className="progress-bar">
            <div className="progress-steps">
              {[1, 2, 3].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="progress-line">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="onboarding-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Basic Information</h2>
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
              
              <div className="form-group">
                <label>Current City *</label>
                <select
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleInputChange}
                  className={errors.currentCity ? 'error' : ''}
                >
                  <option value="">Select your city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.currentCity && <span className="error-message">{errors.currentCity}</span>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>Academic Background</h2>
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
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h2>Study Preferences</h2>
              <div className="form-group">
                <label>Target Degree *</label>
                <select
                  name="targetDegree"
                  value={formData.targetDegree}
                  onChange={handleInputChange}
                  className={errors.targetDegree ? 'error' : ''}
                >
                  <option value="">Select target degree</option>
                  <option value="UG">Undergraduate</option>
                  <option value="Masters">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.targetDegree && <span className="error-message">{errors.targetDegree}</span>}
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
          )}
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        <div className="onboarding-actions">
          <div className="left-actions">
            {currentStep > 1 && (
              <button type="button" onClick={handlePrevious} className="btn-secondary">
                Previous
              </button>
            )}
            <button type="button" onClick={handleSkip} className="btn-skip">
              Skip for now
            </button>
          </div>
          
          <div className="right-actions">
            {currentStep < 3 ? (
              <button type="button" onClick={handleNext} className="btn-primary">
                Save & Continue
              </button>
            ) : (
              <button type="button" onClick={handleFinish} className="btn-primary">
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;