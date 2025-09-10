import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './UniversityDetails.css';

const UniversityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [university, setUniversity] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  useEffect(() => {
    fetchUniversityDetails();
    fetchUniversityScholarships();
    if (isAuthenticated) {
      checkExistingApplication();
    }
  }, [id, isAuthenticated]);

  const fetchUniversityDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/universities/${id}`);
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

  const fetchUniversityScholarships = async () => {
    try {
      setScholarshipsLoading(true);
      const response = await axios.get(`/api/universities/${id}/scholarships`);
      if (response.data.success) {
        setScholarships(response.data.scholarships);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setScholarshipsLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      setCheckingApplication(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/applications/university/${id}/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasActiveApplication(response.data.hasActiveApplication);
    } catch (error) {
      console.error('Error checking application:', error);
      // If there's an error checking, allow the user to apply
      setHasActiveApplication(false);
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/universities/${id}` } } });
      return;
    }
    navigate(`/apply/${id}`);
  };

  const handleSaveScholarship = (scholarship) => {
    const savedScholarships = JSON.parse(localStorage.getItem('savedScholarships') || '[]');
    const isAlreadySaved = savedScholarships.find(s => s._id === scholarship._id);
    
    if (!isAlreadySaved) {
      savedScholarships.push({
        ...scholarship,
        universityName: university.name,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('savedScholarships', JSON.stringify(savedScholarships));
      alert(`${scholarship.name} saved for later!`);
    } else {
      alert(`${scholarship.name} is already saved.`);
    }
  };

  const handleAddToDeadlineTracker = async (university) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add universities to deadline tracker');
        navigate('/login');
        return;
      }

      // Check if university has programs
      if (!university.programs || university.programs.length === 0) {
        alert('No programs available for this university');
        return;
      }

      // For now, add the first program. In a real app, you'd let user choose
      const firstProgram = university.programs[0];

      const response = await axios.post('/api/deadlines/save', {
        universityId: university._id,
        programId: firstProgram._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert(`${university.name} - ${firstProgram.name} added to Deadline Tracker!`);
      }
    } catch (error) {
      console.error('Error adding to deadline tracker:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already saved')) {
        alert(`This program is already in your Deadline Tracker.`);
      } else {
        alert('Failed to add to Deadline Tracker. Please try again.');
      }
    }
  };

  const handleAddToBudget = () => {
    try {
      const savedUniversities = JSON.parse(localStorage.getItem('budgetPlannerUniversities') || '[]');
      const isAlreadyAdded = savedUniversities.find(u => u._id === university._id);
      
      if (!isAlreadyAdded) {
        savedUniversities.push(university);
        localStorage.setItem('budgetPlannerUniversities', JSON.stringify(savedUniversities));
        alert(`${university.name} added to Budget Planner!`);
        navigate('/budget');
      } else {
        alert(`${university.name} is already in your Budget Planner.`);
      }
    } catch (error) {
      console.error('Error adding to budget planner:', error);
      alert('Failed to add to Budget Planner. Please try again.');
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="university-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading university details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/universities')} className="btn-back">
          ← Back to Universities
        </button>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="university-details-error">
        <h2>University Not Found</h2>
        <p>The university you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/universities')} className="btn-back">
          ← Back to Universities
        </button>
      </div>
    );
  }

  return (
    <div className="university-details">
      <div className="university-details-container">
        {/* Header */}
        <div className="university-header">
          <button onClick={() => navigate('/universities')} className="btn-back">
            ← Back to Universities
          </button>
          
          <div className="university-hero">
            {university.images && university.images[0] && (
              <div className="university-hero-image">
                <img src={university.images[0].url} alt={university.name} />
              </div>
            )}
            
            <div className="university-hero-content">
              <h1>{university.name}</h1>
              <div className="university-location">
                📍 {university.city}, {university.country}
              </div>
              
              <div className="university-quick-stats">
                <div className="stat-item">
                  <span className="stat-label">Type:</span>
                  <span className="stat-value">{university.type}</span>
                </div>
                
                {university.ranking?.world && (
                  <div className="stat-item">
                    <span className="stat-label">World Ranking:</span>
                    <span className="stat-value ranking">#{university.ranking.world}</span>
                  </div>
                )}
                
                {university.establishedYear && (
                  <div className="stat-item">
                    <span className="stat-label">Established:</span>
                    <span className="stat-value">{university.establishedYear}</span>
                  </div>
                )}
              </div>
              
              <div className="university-actions">
                {isAuthenticated && (
                  <button 
                    className={`btn-apply ${hasActiveApplication ? 'applied' : ''}`}
                    onClick={handleApply}
                    disabled={checkingApplication}
                  >
                    {checkingApplication ? '⏳ Checking...' : 
                     hasActiveApplication ? '✅ Applied (Click to Apply Again)' : '📝 Apply Now'}
                  </button>
                )}
                <button className="btn-deadline" onClick={() => handleAddToDeadlineTracker(university)}>
                  📅 Add to Deadline Tracker
                </button>
                <button className="btn-budget" onClick={handleAddToBudget}>
                  💰 Add to Budget Planner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="university-content">
          {/* Description */}
          {university.description && (
            <section className="content-section">
              <h2>About {university.name}</h2>
              <p className="university-description">{university.description}</p>
            </section>
          )}

          {/* Tuition Fees */}
          <section className="content-section">
            <h2>Tuition Fees</h2>
            <div className="tuition-grid">
              {university.tuitionFee?.undergraduate && (
                <div className="tuition-card">
                  <h3>Undergraduate</h3>
                  <div className="tuition-range">
                    {formatCurrency(university.tuitionFee.undergraduate.min, university.tuitionFee.undergraduate.currency)} - 
                    {formatCurrency(university.tuitionFee.undergraduate.max, university.tuitionFee.undergraduate.currency)}
                  </div>
                  {university.tuitionBDT?.undergraduate && (
                    <div className="tuition-bdt">
                      ৳{university.tuitionBDT.undergraduate.min?.toLocaleString()} - 
                      ৳{university.tuitionBDT.undergraduate.max?.toLocaleString()} BDT
                    </div>
                  )}
                </div>
              )}
              
              {university.tuitionFee?.graduate && (
                <div className="tuition-card">
                  <h3>Graduate</h3>
                  <div className="tuition-range">
                    {formatCurrency(university.tuitionFee.graduate.min, university.tuitionFee.graduate.currency)} - 
                    {formatCurrency(university.tuitionFee.graduate.max, university.tuitionFee.graduate.currency)}
                  </div>
                  {university.tuitionBDT?.graduate && (
                    <div className="tuition-bdt">
                      ৳{university.tuitionBDT.graduate.min?.toLocaleString()} - 
                      ৳{university.tuitionBDT.graduate.max?.toLocaleString()} BDT
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* University Scholarships */}
          {university.scholarships && university.scholarships.length > 0 && (
            <section className="content-section">
              <h2>University Scholarships</h2>
              <div className="scholarships-grid">
                {university.scholarships.map((scholarship, index) => (
                  <div key={index} className="scholarship-card">
                    <div className="scholarship-header">
                      <h3>{scholarship.name}</h3>
                      <div className="scholarship-type">
                        <span className="type-badge">{scholarship.type}</span>
                      </div>
                    </div>
                    
                    <div className="scholarship-details">
                      <div className="scholarship-coverage">
                        <span className="coverage-label">Coverage:</span>
                        <span className="coverage-value">{scholarship.coverage}</span>
                      </div>
                      
                      {scholarship.deadline && (
                        <div className="scholarship-deadline">
                          <span className="deadline-label">Application Deadline:</span>
                          <span className="deadline-value">{formatDate(scholarship.deadline)}</span>
                        </div>
                      )}
                      
                      <div className="scholarship-actions">
                        <button 
                          className="btn-apply-scholarship"
                          onClick={() => window.open(university.contact?.website || '#', '_blank')}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* External Scholarships */}
          <section className="content-section">
            <h2>External Scholarships</h2>
            {scholarshipsLoading ? (
              <div className="scholarships-loading">
                <div className="loading-spinner"></div>
                <p>Loading scholarships...</p>
              </div>
            ) : scholarships.length > 0 ? (
              <div className="scholarships-grid">
                {scholarships.map((scholarship, index) => (
                  <div key={index} className="scholarship-card">
                    <div className="scholarship-header">
                      <h3>{scholarship.name}</h3>
                      <div className="scholarship-coverage">
                        <span className="coverage-badge">{scholarship.coveragePercent}% Coverage</span>
                        {scholarship.amountBDT && (
                          <span className="amount-badge">৳{scholarship.amountBDT.toLocaleString()} BDT</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="scholarship-details">
                      {scholarship.deadline && (
                        <div className="scholarship-deadline">
                          <span className="deadline-label">Application Deadline:</span>
                          <span className="deadline-value">{formatDate(scholarship.deadline)}</span>
                        </div>
                      )}
                      
                      {scholarship.rolling && (
                        <div className="scholarship-rolling">
                          <span className="rolling-badge">Rolling Admission</span>
                        </div>
                      )}
                      
                      {scholarship.stipendMonthlyBDT > 0 && (
                        <div className="scholarship-stipend">
                          <span className="stipend-label">Monthly Stipend:</span>
                          <span className="stipend-value">৳{scholarship.stipendMonthlyBDT.toLocaleString()} BDT</span>
                        </div>
                      )}
                       
                       <div className="scholarship-actions">
                         <button 
                           className="btn-apply-scholarship"
                           onClick={() => window.open(university.contact?.website || '#', '_blank')}
                         >
                           Apply Now
                         </button>
                         <button 
                           className="btn-save-scholarship"
                           onClick={() => handleSaveScholarship(scholarship)}
                         >
                           Save for Later
                         </button>
                       </div>
                     </div>
                   </div>
                ))}
              </div>
            ) : (
              <div className="no-scholarships">
                <p>No scholarships available for this university at the moment.</p>
              </div>
            )}
          </section>

          {/* Programs */}
          {university.programs && university.programs.length > 0 && (
            <section className="content-section">
              <h2>Available Programs</h2>
              <div className="programs-grid">
                {university.programs.map((program, index) => (
                  <div key={index} className="program-card">
                    <h3>{program.name}</h3>
                    <div className="program-details">
                      <div className="program-detail">
                        <span className="label">Level:</span>
                        <span className="value">{program.level}</span>
                      </div>
                      <div className="program-detail">
                        <span className="label">Duration:</span>
                        <span className="value">{program.duration}</span>
                      </div>
                      
                      {/* Enhanced Requirements Display */}
                      {program.requirements && (
                        <div className="program-requirements">
                          <h4>Requirements:</h4>
                          <div className="requirements-list">
                            {program.requirements.gpa && (
                              <div className="requirement-item">
                                <span className="req-label">Min GPA:</span>
                                <span className="req-value">{program.requirements.gpa}/4.0</span>
                              </div>
                            )}
                            
                            {program.requirements.englishTest && (
                              <div className="requirement-item">
                                <span className="req-label">{program.requirements.englishTest}:</span>
                                <span className="req-value">{program.requirements.minScore}</span>
                              </div>
                            )}
                            
                            {program.requirements.satScore && (
                              <div className="requirement-item">
                                <span className="req-label">SAT Score:</span>
                                <span className="req-value">{program.requirements.satScore}</span>
                              </div>
                            )}
                            
                            {program.requirements.gmatScore && (
                              <div className="requirement-item">
                                <span className="req-label">GMAT Score:</span>
                                <span className="req-value">{program.requirements.gmatScore}</span>
                              </div>
                            )}
                            
                            {program.requirements.greScore && (
                              <div className="requirement-item">
                                <span className="req-label">GRE Score:</span>
                                <span className="req-value">{program.requirements.greScore}</span>
                              </div>
                            )}
                            
                            {program.requirements.mcatScore && (
                              <div className="requirement-item">
                                <span className="req-label">MCAT Score:</span>
                                <span className="req-value">{program.requirements.mcatScore}</span>
                              </div>
                            )}
                            
                            {program.requirements.aLevels && (
                              <div className="requirement-item">
                                <span className="req-label">A-Levels:</span>
                                <span className="req-value">{program.requirements.aLevels}</span>
                              </div>
                            )}
                            
                            {program.requirements.atar && (
                              <div className="requirement-item">
                                <span className="req-label">ATAR:</span>
                                <span className="req-value">{program.requirements.atar}</span>
                              </div>
                            )}
                            
                            {program.requirements.workExperience && (
                              <div className="requirement-item">
                                <span className="req-label">Work Experience:</span>
                                <span className="req-value">{program.requirements.workExperience}</span>
                              </div>
                            )}
                            
                            {program.requirements.germanProficiency && (
                              <div className="requirement-item">
                                <span className="req-label">German:</span>
                                <span className="req-value">{program.requirements.germanProficiency}</span>
                              </div>
                            )}
                            
                            {program.requirements.frenchProficiency && (
                              <div className="requirement-item">
                                <span className="req-label">French:</span>
                                <span className="req-value">{program.requirements.frenchProficiency}</span>
                              </div>
                            )}
                            
                            {program.requirements.koreanProficiency && (
                              <div className="requirement-item">
                                <span className="req-label">Korean:</span>
                                <span className="req-value">{program.requirements.koreanProficiency}</span>
                              </div>
                            )}
                            
                            {program.requirements.japaneseProficiency && (
                              <div className="requirement-item">
                                <span className="req-label">Japanese:</span>
                                <span className="req-value">{program.requirements.japaneseProficiency}</span>
                              </div>
                            )}
                            
                            {program.requirements.additionalRequirements && (
                              <div className="requirement-item">
                                <span className="req-label">Additional:</span>
                                <span className="req-value">{program.requirements.additionalRequirements}</span>
                              </div>
                            )}
                            
                            {program.requirements.additionalTests && program.requirements.additionalTests.length > 0 && (
                              <div className="requirement-item">
                                <span className="req-label">Additional Tests:</span>
                                <span className="req-value">{program.requirements.additionalTests.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {program.applicationDeadline && (
                        <div className="program-detail deadline-highlight">
                          <span className="label">Application Deadline:</span>
                          <span className="value deadline">{formatDate(program.applicationDeadline)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Admission Requirements */}
          {university.admissionRequirements && (
            <section className="content-section">
              <h2>Admission Requirements</h2>
              <div className="requirements-grid">
                {university.admissionRequirements.gpa && (
                  <div className="requirement-card">
                    <h3>GPA Requirements</h3>
                    <p>Minimum: {university.admissionRequirements.gpa.min}</p>
                    {university.admissionRequirements.gpa.max && (
                      <p>Maximum: {university.admissionRequirements.gpa.max}</p>
                    )}
                  </div>
                )}
                
                {university.admissionRequirements.englishTests && university.admissionRequirements.englishTests.length > 0 && (
                  <div className="requirement-card">
                    <h3>English Tests</h3>
                    {university.admissionRequirements.englishTests.map((test, index) => (
                      <p key={index}>{test.test}: {test.minScore}</p>
                    ))}
                  </div>
                )}
                
                {university.admissionRequirements.standardizedTests && university.admissionRequirements.standardizedTests.length > 0 && (
                  <div className="requirement-card">
                    <h3>Standardized Tests</h3>
                    {university.admissionRequirements.standardizedTests.map((test, index) => (
                      <p key={index}>{test.test}: {test.minScore}</p>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Facilities */}
          {university.facilities && university.facilities.length > 0 && (
            <section className="content-section">
              <h2>Campus Facilities</h2>
              <div className="facilities-grid">
                {university.facilities.map((facility, index) => (
                  <div key={index} className="facility-item">
                    <span className="facility-icon">🏢</span>
                    <span className="facility-name">{facility}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Living Costs */}
          {university.livingCostBDT && (
            <section className="content-section">
              <h2>Living Costs</h2>
              <div className="living-costs-grid">
                {university.livingCostBDT.monthly && (
                  <div className="cost-card">
                    <h3>Monthly Living Cost</h3>
                    <div className="cost-range">
                      ৳{university.livingCostBDT.monthly.min?.toLocaleString()} - 
                      ৳{university.livingCostBDT.monthly.max?.toLocaleString()} BDT
                    </div>
                  </div>
                )}
                
                {university.livingCostBDT.annual && (
                  <div className="cost-card">
                    <h3>Annual Living Cost</h3>
                    <div className="cost-range">
                      ৳{university.livingCostBDT.annual.min?.toLocaleString()} - 
                      ৳{university.livingCostBDT.annual.max?.toLocaleString()} BDT
                    </div>
                  </div>
                )}
                
                {university.visaFeeBDT && (
                  <div className="cost-card">
                    <h3>Visa Fee</h3>
                    <div className="cost-single">
                      ৳{university.visaFeeBDT.toLocaleString()} BDT
                    </div>
                  </div>
                )}
                
                {university.otherFeesBDT && (
                  <div className="cost-card">
                    <h3>Other Fees</h3>
                    <div className="other-fees-breakdown">
                      {university.otherFeesBDT.insurance && (
                        <div className="fee-item">
                          <span>Insurance:</span>
                          <span>৳{university.otherFeesBDT.insurance.toLocaleString()}</span>
                        </div>
                      )}
                      {university.otherFeesBDT.admin && (
                        <div className="fee-item">
                          <span>Admin:</span>
                          <span>৳{university.otherFeesBDT.admin.toLocaleString()}</span>
                        </div>
                      )}
                      {university.otherFeesBDT.application && (
                        <div className="fee-item">
                          <span>Application:</span>
                          <span>৳{university.otherFeesBDT.application.toLocaleString()}</span>
                        </div>
                      )}
                      {university.otherFeesBDT.total && (
                        <div className="fee-item total">
                          <span>Total:</span>
                          <span>৳{university.otherFeesBDT.total.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Campus Life */}
          {university.campusLife && (
            <section className="content-section">
              <h2>Campus Life</h2>
              <div className="campus-grid">
                {university.campusLife.studentPopulation && (
                  <div className="campus-stat">
                    <h3>Student Population</h3>
                    <p>{university.campusLife.studentPopulation.toLocaleString()}</p>
                  </div>
                )}
                
                {university.campusLife.internationalStudents && (
                  <div className="campus-stat">
                    <h3>International Students</h3>
                    <p>{university.campusLife.internationalStudents.toLocaleString()}</p>
                  </div>
                )}
                
                {university.campusLife.campusSize && (
                  <div className="campus-stat">
                    <h3>Campus Size</h3>
                    <p>{university.campusLife.campusSize}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Part-Time Job Opportunities */}
          {university.campusLife?.partTimeJobOpportunities && (
            <section className="content-section">
              <h2>Part-Time Job Opportunities</h2>
              <div className="job-opportunities-content">
                <div className="job-overview">
                  <div className="job-availability">
                    <h3>Availability</h3>
                    <span className={`availability-badge ${university.campusLife.partTimeJobOpportunities.availability?.toLowerCase()}`}>
                      {university.campusLife.partTimeJobOpportunities.availability}
                    </span>
                  </div>
                  
                  {university.campusLife.partTimeJobOpportunities.averageHourlyWage?.amount && (
                    <div className="job-wage">
                      <h3>Average Hourly Wage</h3>
                      <p>{university.campusLife.partTimeJobOpportunities.averageHourlyWage.currency} {university.campusLife.partTimeJobOpportunities.averageHourlyWage.amount}</p>
                    </div>
                  )}
                </div>
                
                {university.campusLife.partTimeJobOpportunities.workPermitInfo && (
                  <div className="work-permit-info">
                    <h3>Work Permit Information</h3>
                    <div className="permit-details">
                      <div className="permit-item">
                        <span>On-Campus Work:</span>
                        <span className={university.campusLife.partTimeJobOpportunities.workPermitInfo.onCampusAllowed ? 'allowed' : 'not-allowed'}>
                          {university.campusLife.partTimeJobOpportunities.workPermitInfo.onCampusAllowed ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                      <div className="permit-item">
                        <span>Off-Campus Work:</span>
                        <span className={university.campusLife.partTimeJobOpportunities.workPermitInfo.offCampusAllowed ? 'allowed' : 'not-allowed'}>
                          {university.campusLife.partTimeJobOpportunities.workPermitInfo.offCampusAllowed ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                      {university.campusLife.partTimeJobOpportunities.workPermitInfo.hoursPerWeek && (
                        <div className="permit-item">
                          <span>Hours per Week:</span>
                          <span>{university.campusLife.partTimeJobOpportunities.workPermitInfo.hoursPerWeek}</span>
                        </div>
                      )}
                      {university.campusLife.partTimeJobOpportunities.workPermitInfo.additionalInfo && (
                        <div className="permit-additional">
                          <p>{university.campusLife.partTimeJobOpportunities.workPermitInfo.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {university.campusLife.partTimeJobOpportunities.popularFields && university.campusLife.partTimeJobOpportunities.popularFields.length > 0 && (
                  <div className="popular-fields">
                    <h3>Popular Job Fields</h3>
                    <div className="fields-grid">
                      {university.campusLife.partTimeJobOpportunities.popularFields.map((field, index) => (
                        <div key={index} className="field-card">
                          <div className="field-header">
                            <h4>{field.field}</h4>
                            <span className={`demand-level ${field.demandLevel?.toLowerCase()}`}>
                              {field.demandLevel} Demand
                            </span>
                          </div>
                          {field.description && (
                            <p className="field-description">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {university.campusLife.partTimeJobOpportunities.description && (
                  <div className="job-description">
                    <h3>Additional Information</h3>
                    <p>{university.campusLife.partTimeJobOpportunities.description}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Contact Information */}
          {university.contact && (
            <section className="content-section">
              <h2>Contact Information</h2>
              <div className="contact-grid">
                {university.contact.website && (
                  <div className="contact-item">
                    <span className="contact-label">Website:</span>
                    <a href={university.contact.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                      {university.contact.website}
                    </a>
                  </div>
                )}
                
                {university.contact.email && (
                  <div className="contact-item">
                    <span className="contact-label">Email:</span>
                    <a href={`mailto:${university.contact.email}`} className="contact-link">
                      {university.contact.email}
                    </a>
                  </div>
                )}
                
                {university.contact.phone && (
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{university.contact.phone}</span>
                  </div>
                )}
                
                {university.contact.address && (
                  <div className="contact-item">
                    <span className="contact-label">Address:</span>
                    <span className="contact-value">{university.contact.address}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityDetails;