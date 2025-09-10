import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
  const [universities, setUniversities] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [selectedScholarships, setSelectedScholarships] = useState([]);
  const [duration, setDuration] = useState(4);
  const [budgetResults, setBudgetResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('finalCostBDT');
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);

  // Fetch universities for selection
  useEffect(() => {
    fetchUniversities();
    fetchScholarships();
    loadSavedUniversities();
  }, []);

  const loadSavedUniversities = () => {
    const savedUniversities = JSON.parse(localStorage.getItem('budgetPlannerUniversities') || '[]');
    if (savedUniversities.length > 0) {
      setSelectedUniversities(savedUniversities);
      // Clear localStorage after loading
      localStorage.removeItem('budgetPlannerUniversities');
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/budget/universities?limit=50');
      if (response.data.success) {
        setUniversities(response.data.data.universities);
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
    }
  };

  const fetchScholarships = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/scholarships', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setScholarships(response.data.data.scholarships);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    }
  };

  const handleUniversitySelect = (university) => {
    const isSelected = selectedUniversities.find(u => u._id === university._id);
    if (isSelected) {
      setSelectedUniversities(selectedUniversities.filter(u => u._id !== university._id));
    } else {
      setSelectedUniversities([...selectedUniversities, university]);
    }
  };

  const handleScholarshipSelect = (scholarship) => {
    const isSelected = selectedScholarships.find(s => s._id === scholarship._id);
    if (isSelected) {
      setSelectedScholarships(selectedScholarships.filter(s => s._id !== scholarship._id));
    } else {
      setSelectedScholarships([...selectedScholarships, scholarship]);
    }
  };

  const calculateBudget = async () => {
    if (selectedUniversities.length === 0) {
      alert('Please select at least one university');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/budget/calc', {
        universityIds: selectedUniversities.map(u => u._id),
        durationYears: duration,
        scholarshipIds: selectedScholarships.map(s => s._id)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBudgetResults(response.data.data);
      }
    } catch (error) {
      console.error('Error calculating budget:', error);
      alert('Error calculating budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredUniversities = universities.filter(university => {
    const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         university.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !countryFilter || university.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const sortedResults = budgetResults?.calculations?.sort((a, b) => {
    switch (sortBy) {
      case 'university':
        return a.university.localeCompare(b.university);
      case 'tuitionTotalBDT':
        return a.tuitionTotalBDT - b.tuitionTotalBDT;
      case 'livingTotalBDT':
        return a.livingTotalBDT - b.livingTotalBDT;
      case 'finalCostBDT':
      default:
        return a.finalCostBDT - b.finalCostBDT;
    }
  });

  const countries = [...new Set(universities.map(u => u.country))];

  return (
    <div className="budget-planner">
      <div className="budget-planner-header">
        <h1>🎓 Study Abroad Budget Planner</h1>
        <p>Compare costs across universities and apply scholarships to find your best option</p>
      </div>

      <div className="budget-planner-content">
        {/* University Selection Section */}
        <div className="selection-section">
          <h2>📚 Select Universities</h2>
          
          <div className="filters">
            <input
              type="text"
              placeholder="Search universities, countries, or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="country-filter"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="university-grid">
            {filteredUniversities.map(university => {
              const isSelected = selectedUniversities.find(u => u._id === university._id);
              return (
                <div
                  key={university._id}
                  className={`university-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleUniversitySelect(university)}
                >
                  <h3>{university.name}</h3>
                  <p className="location">📍 {university.city}, {university.country}</p>
                  <div className="cost-preview">
                    <span className="tuition">
                      Tuition: {formatCurrency(university.tuitionBDT?.undergraduate?.min || 0)} - {formatCurrency(university.tuitionBDT?.undergraduate?.max || 0)}
                    </span>
                    <span className="living">
                      Living: {formatCurrency((university.livingCostBDT?.monthly?.min || 0) * 12)} - {formatCurrency((university.livingCostBDT?.monthly?.max || 0) * 12)}/year
                    </span>
                  </div>
                  {isSelected && <div className="selected-badge">✓ Selected</div>}
                </div>
              );
            })}
          </div>

          {selectedUniversities.length > 0 && (
            <div className="selected-summary">
              <h3>Selected Universities ({selectedUniversities.length})</h3>
              <div className="selected-list">
                {selectedUniversities.map(university => (
                  <span key={university._id} className="selected-tag">
                    {university.name}
                    <button onClick={() => handleUniversitySelect(university)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Configuration Section */}
        <div className="config-section">
          <h2>⚙️ Study Configuration</h2>
          
          <div className="config-grid">
            <div className="duration-config">
              <label htmlFor="duration">Study Duration (Years)</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="duration-select"
              >
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={4}>4 Years</option>
                <option value={5}>5 Years</option>
              </select>
            </div>

            <div className="scholarship-config">
              <label>Apply Scholarships</label>
              <button
                onClick={() => setShowScholarshipModal(true)}
                className="scholarship-btn"
              >
                {selectedScholarships.length > 0 
                  ? `${selectedScholarships.length} Scholarships Selected`
                  : 'Select Scholarships'
                }
              </button>
            </div>
          </div>

          <button
            onClick={calculateBudget}
            disabled={loading || selectedUniversities.length === 0}
            className="calculate-btn"
          >
            {loading ? '⏳ Calculating...' : '💰 Calculate Budget'}
          </button>
        </div>

        {/* Results Section */}
        {budgetResults && (
          <div className="results-section">
            <h2>📊 Budget Comparison Results</h2>
            
            <div className="results-summary">
              <div className="summary-card">
                <h3>💡 Summary</h3>
                <p><strong>Universities Compared:</strong> {budgetResults.summary.totalUniversities}</p>
                <p><strong>Cheapest Option:</strong> {budgetResults.summary.cheapestOption.university}</p>
                <p><strong>Lowest Cost:</strong> {formatCurrency(budgetResults.summary.cheapestOption.finalCostBDT)}</p>
                <p><strong>Average Cost:</strong> {formatCurrency(budgetResults.summary.averageCost)}</p>
              </div>
            </div>

            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="finalCostBDT">Total Cost</option>
                <option value="tuitionTotalBDT">Tuition Cost</option>
                <option value="livingTotalBDT">Living Cost</option>
                <option value="university">University Name</option>
              </select>
            </div>

            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Location</th>
                    <th>Tuition ({duration} years)</th>
                    <th>Living ({duration} years)</th>
                    <th>Visa & Other</th>
                    <th>Scholarship</th>
                    <th>Final Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults?.map((result, index) => (
                    <tr key={result.universityId} className={index === 0 ? 'cheapest' : ''}>
                      <td>
                        <strong>{result.university}</strong>
                        {index === 0 && <span className="best-deal">🏆 Best Deal</span>}
                      </td>
                      <td>{result.city}, {result.country}</td>
                      <td>{formatCurrency(result.tuitionTotalBDT)}</td>
                      <td>{formatCurrency(result.livingTotalBDT)}</td>
                      <td>{formatCurrency(result.visaFeeBDT + result.otherFeesBDT)}</td>
                      <td className="scholarship-deduction">
                        -{formatCurrency(result.scholarshipDeductionBDT)}
                      </td>
                      <td className="final-cost">
                        <strong>{formatCurrency(result.finalCostBDT)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Scholarship Selection Modal */}
      {showScholarshipModal && (
        <div className="modal-overlay" onClick={() => setShowScholarshipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎓 Select Scholarships</h3>
              <button onClick={() => setShowScholarshipModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="scholarship-list">
                {scholarships.map(scholarship => {
                  const isSelected = selectedScholarships.find(s => s._id === scholarship._id);
                  return (
                    <div
                      key={scholarship._id}
                      className={`scholarship-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleScholarshipSelect(scholarship)}
                    >
                      <div className="scholarship-info">
                        <h4>{scholarship.name}</h4>
                        <p>{scholarship.university} - {scholarship.country}</p>
                        <div className="scholarship-details">
                          <span className="amount">
                            {scholarship.coverageType === 'percentage' 
                              ? `${scholarship.coveragePercentage}% Coverage`
                              : `${formatCurrency(scholarship.amount || 0)}`
                            }
                          </span>
                          <span className="type">{scholarship.type}</span>
                        </div>
                      </div>
                      {isSelected && <div className="selected-badge">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowScholarshipModal(false)} className="done-btn">
                Done ({selectedScholarships.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;