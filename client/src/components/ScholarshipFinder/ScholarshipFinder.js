import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ScholarshipFinder.css';
import LoadingSpinner from '../LoadingSpinner';

const ScholarshipFinder = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    countries: [],
    cities: [],
    degreeLevels: [],
    fields: []
  });
  const [searchParams, setSearchParams] = useState({
    country: '',
    city: '',
    degreeLevel: '',
    field: '',
    meritBased: '',
    needBased: '',
    minGPA: '',
    maxIncome: '',
    minIELTS: '',
    minTOEFL: '',
    minGRE: '',
    minCoverage: '',
    minAmount: '',
    maxAmount: '',
    sort: 'deadline',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalScholarships, setTotalScholarships] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile for eligibility checking
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get('/api/scholarships/filters');
        setFilters(response.data);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch scholarships
  useEffect(() => {
    fetchScholarships();
  }, [searchParams]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await axios.get(`/api/scholarships?${params.toString()}`);
      setScholarships(response.data.scholarships);
      setTotalPages(response.data.pagination.totalPages);
      setTotalScholarships(response.data.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      country: '',
      city: '',
      degreeLevel: '',
      field: '',
      meritBased: '',
      needBased: '',
      minGPA: '',
      maxIncome: '',
      minIELTS: '',
      minTOEFL: '',
      minGRE: '',
      minCoverage: '',
      minAmount: '',
      maxAmount: '',
      sort: 'deadline',
      page: 1,
      limit: 12
    });
  };

  const handleCardClick = (scholarship) => {
    try {
      if (scholarship.university && scholarship.university._id) {
        navigate(`/universities/${scholarship.university._id}`);
      } else {
        console.warn('University information not available for this scholarship');
        // You could show a toast notification here
        alert('University information is not available for this scholarship.');
      }
    } catch (error) {
      console.error('Error navigating to university:', error);
      alert('An error occurred while trying to view university details. Please try again.');
    }
  };

  const checkEligibility = (scholarship) => {
    if (!userProfile) return false;

    const profile = userProfile;
    
    // Check GPA requirement
    if (scholarship.minGPA && profile.gpa && profile.gpa < scholarship.minGPA) {
      return false;
    }

    // Check income requirement (for need-based scholarships)
    if (scholarship.needBased && scholarship.incomeMaxBDT && profile.familyIncome && profile.familyIncome > scholarship.incomeMaxBDT) {
      return false;
    }

    // Check IELTS requirement
    if (scholarship.ieltsMin && profile.ieltsScore && profile.ieltsScore < scholarship.ieltsMin) {
      return false;
    }

    // Check TOEFL requirement
    if (scholarship.toeflMin && profile.toeflScore && profile.toeflScore < scholarship.toeflMin) {
      return false;
    }

    // Check GRE requirement
    if (scholarship.greMin && profile.greScore && profile.greScore < scholarship.greMin) {
      return false;
    }

    return true;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="scholarship-finder">
      <div className="scholarship-finder-header">
        <h1>Scholarship Finder</h1>
        <p>Find scholarships that match your profile and goals</p>
      </div>

      <div className="scholarship-finder-content">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <label>Country</label>
            <select
              value={searchParams.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">All Countries</option>
              {filters.countries?.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>City</label>
            <select
              value={searchParams.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {filters.cities?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Degree Level</label>
            <select
              value={searchParams.degreeLevel}
              onChange={(e) => handleFilterChange('degreeLevel', e.target.value)}
            >
              <option value="">All Levels</option>
              {filters.degreeLevels?.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Field of Study</label>
            <select
              value={searchParams.field}
              onChange={(e) => handleFilterChange('field', e.target.value)}
            >
              <option value="">All Fields</option>
              {filters.fields?.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Scholarship Type</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={searchParams.meritBased === 'true'}
                  onChange={(e) => handleFilterChange('meritBased', e.target.checked ? 'true' : '')}
                />
                Merit-based
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={searchParams.needBased === 'true'}
                  onChange={(e) => handleFilterChange('needBased', e.target.checked ? 'true' : '')}
                />
                Need-based
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Minimum GPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={searchParams.minGPA}
              onChange={(e) => handleFilterChange('minGPA', e.target.value)}
              placeholder="e.g., 3.5"
            />
          </div>

          <div className="filter-group">
            <label>Maximum Family Income (BDT)</label>
            <input
              type="number"
              value={searchParams.maxIncome}
              onChange={(e) => handleFilterChange('maxIncome', e.target.value)}
              placeholder="e.g., 500000"
            />
          </div>

          <div className="filter-group">
            <label>Minimum IELTS Score</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="9"
              value={searchParams.minIELTS}
              onChange={(e) => handleFilterChange('minIELTS', e.target.value)}
              placeholder="e.g., 6.5"
            />
          </div>

          <div className="filter-group">
            <label>Minimum Coverage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={searchParams.minCoverage}
              onChange={(e) => handleFilterChange('minCoverage', e.target.value)}
              placeholder="e.g., 50"
            />
          </div>

          <div className="filter-group">
            <label>Amount Range (BDT)</label>
            <div className="range-inputs">
              <input
                type="number"
                value={searchParams.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                placeholder="Min"
              />
              <input
                type="number"
                value={searchParams.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={searchParams.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="deadline">Deadline</option>
              <option value="coverage">Coverage %</option>
              <option value="amount">Amount</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="results-header">
            <h3>
              {totalScholarships} Scholarships Found
              {searchParams.country && ` in ${searchParams.country}`}
              {searchParams.degreeLevel && ` for ${searchParams.degreeLevel}`}
            </h3>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="scholarships-grid">
                {scholarships?.map(scholarship => {
                  const isEligible = checkEligibility(scholarship);
                  return (
                    <div 
                      key={scholarship._id} 
                      className="scholarship-card clickable"
                      onClick={() => handleCardClick(scholarship)}
                    >
                      {isEligible && (
                        <div className="eligible-badge">Eligible</div>
                      )}
                      
                      <div className="scholarship-header">
                        <h4>{scholarship.name}</h4>
                        <div className="university-name">
                          {scholarship.university?.name}
                        </div>
                      </div>

                      <div className="scholarship-info">
                        <div className="info-item">
                          <span className="icon">📍</span>
                          <span>{scholarship.city}, {scholarship.country}</span>
                        </div>
                        
                        <div className="info-item">
                          <span className="icon">📚</span>
                          <span>{scholarship.fields?.join(', ') || 'N/A'}</span>
                        </div>

                        <div className="info-item">
                          <span className="icon">🎓</span>
                          <span>{scholarship.degreeLevel}</span>
                        </div>

                        <div className="info-item scholarship-percentage">
                          <span className="icon">💰</span>
                          <span className="percentage">{scholarship.coveragePercent}% Scholarship</span>
                        </div>
                        
                        <div className="view-university-hint">
                          <span className="icon">👆</span>
                          <span>Click to view university details</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(searchParams.page - 1)}
                    disabled={searchParams.page === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, searchParams.page - 2) + i;
                      if (pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`page-btn ${pageNum === searchParams.page ? 'active' : ''}`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(searchParams.page + 1)}
                    disabled={searchParams.page === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipFinder;