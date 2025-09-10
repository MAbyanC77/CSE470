import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UniversitySearch.css';

const UniversitySearch = () => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    countries: [],
    cities: [],
    types: [],
    programLevels: []
  });
  

  const [searchParams, setSearchParams] = useState({
    q: '',
    country: '',
    city: '',
    type: '',
    minRanking: '',
    maxRanking: '',
    minTuition: '',
    maxTuition: '',
    programs: '',
    level: '',
    sortBy: 'ranking.world',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  const [showFilters, setShowFilters] = useState(true);

  // Fetch universities
  const fetchUniversities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        ...searchParams,
        page,
        limit: pagination.limit,
        includeScholarshipCount: 'true'
      };
      
      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get('/api/universities', { params });
      setUniversities(response.data.data);
      setPagination({
        current: response.data.pagination.currentPage,
        pages: response.data.pagination.totalPages,
        total: response.data.pagination.totalItems,
        limit: pagination.limit
      });
      setFilters(response.data.filters || {
        countries: [],
        cities: [],
        types: [],
        programLevels: []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setLoading(false);
    }
   }, [searchParams, pagination.limit]);

  // Initial load
  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUniversities(1);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy,
      sortOrder
    }));
    fetchUniversities(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchParams({
      q: '',
      country: '',
      city: '',
      type: '',
      minRanking: '',
      maxRanking: '',
      minTuition: '',
      maxTuition: '',
      programs: '',
      level: '',
      sortBy: 'ranking.world',
      sortOrder: 'asc'
    });
    fetchUniversities(1);
  };

  // Handle view scholarships
  const handleViewScholarships = (universityId) => {
    navigate(`/scholarships?university=${universityId}`);
  };



  return (
    <div className="university-search">
        <div className="search-header">
           <h2>Find Your Perfect University</h2>
           <p>Search through thousands of universities worldwide</p>
         </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search universities, programs, or locations..."
            value={searchParams.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '🔄' : '🔍'} Search
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="filter-toggle">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
        >
          🎛️ Filters {showFilters ? '▲' : '▼'}
        </button>
        <div className="sort-controls">
          <select 
            value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleSortChange(sortBy, sortOrder);
            }}
            className="sort-select"
          >
            <option value="ranking.world-asc">Ranking (Best First)</option>
            <option value="ranking.world-desc">Ranking (Worst First)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="tuition-asc">Tuition (Low to High)</option>
            <option value="tuition-desc">Tuition (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>Country</label>
              <select 
                value={searchParams.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <option value="">All Countries</option>
                {filters.countries && filters.countries.map(country => (
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
                {filters.cities && filters.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select 
                value={searchParams.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                {filters.types && filters.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Program Level</label>
              <select 
                value={searchParams.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                {filters.programLevels && filters.programLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>World Ranking Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchParams.minRanking}
                  onChange={(e) => handleFilterChange('minRanking', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={searchParams.maxRanking}
                  onChange={(e) => handleFilterChange('maxRanking', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Annual Tuition (USD)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={searchParams.minTuition}
                  onChange={(e) => handleFilterChange('minTuition', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={searchParams.maxTuition}
                  onChange={(e) => handleFilterChange('maxTuition', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Program/Field</label>
              <input
                type="text"
                placeholder="e.g., Computer Science"
                value={searchParams.programs}
                onChange={(e) => handleFilterChange('programs', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" onClick={handleSearch} className="apply-filters-btn">
              Apply Filters
            </button>
            <button type="button" onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="search-results">
        <div className="results-header">
          <h3>
            {pagination.total > 0 
              ? `Found ${pagination.total} universities`
              : 'No universities found'
            }
          </h3>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching universities...</p>
          </div>
        ) : (
          <>
            <div className="universities-grid">
              {universities.map(university => (
                <UniversityCard key={university._id} university={university} onViewScholarships={handleViewScholarships} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => fetchUniversities(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.current} of {pagination.pages}
                </div>
                
                <button 
                  onClick={() => fetchUniversities(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// University Card Component
const UniversityCard = ({ university, onViewScholarships }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTuitionRange = (tuitionFee) => {
    if (!tuitionFee) return 'Contact for fees';
    
    const undergrad = tuitionFee.undergraduate;
    const grad = tuitionFee.graduate;
    
    if (undergrad && undergrad.min) {
      const min = formatCurrency(undergrad.min, undergrad.currency);
      const max = undergrad.max ? formatCurrency(undergrad.max, undergrad.currency) : min;
      return undergrad.min === undergrad.max ? min : `${min} - ${max}`;
    }
    
    if (grad && grad.min) {
      const min = formatCurrency(grad.min, grad.currency);
      const max = grad.max ? formatCurrency(grad.max, grad.currency) : min;
      return grad.min === grad.max ? min : `${min} - ${max}`;
    }
    
    return 'Contact for fees';
  };

  const handleCardClick = () => {
    navigate(`/universities/${university._id}`);
  };

  return (
    <div className="university-card" onClick={handleCardClick}>
      <div className="university-header">
        <h3 className="university-name">{university.name}</h3>
        <div className="university-location">
          📍 {university.city}, {university.country}
        </div>
      </div>

      <div className="university-info">
        <div className="info-item">
          <span className="label">Type:</span>
          <span className="value">{university.type}</span>
        </div>
        
        {university.ranking && university.ranking.world && (
          <div className="info-item">
            <span className="label">Ranking:</span>
            <span className="value ranking">#{university.ranking.world}</span>
          </div>
        )}
        
        <div className="info-item">
          <span className="label">Tuition:</span>
          <span className="value">{getTuitionRange(university.tuitionFee)}</span>
        </div>
        
        {university.scholarshipCount !== undefined && (
          <div className="info-item">
            <span className="label">Scholarships:</span>
            <span className="value scholarship-count">{university.scholarshipCount} available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitySearch;