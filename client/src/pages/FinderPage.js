import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UniversitySearch from '../components/UniversitySearch';
import ScholarshipFinder from '../components/ScholarshipFinder/ScholarshipFinder';
import './FinderPage.css';

const FinderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('universities');

  // Check URL parameters to determine initial tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const university = searchParams.get('university');
    
    if (tab === 'scholarships' || university) {
      setActiveTab('scholarships');
    } else {
      setActiveTab('universities');
    }
  }, [location.search]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without university parameter when switching tabs
    if (tab === 'universities') {
      navigate('/finder?tab=universities', { replace: true });
    } else {
      navigate('/finder?tab=scholarships', { replace: true });
    }
  };

  return (
    <div className="finder-page">
      <div className="finder-header">
        <h1>University & Scholarship Finder</h1>
        <p>Discover your perfect university and find scholarships to fund your education</p>
      </div>

      <div className="finder-tabs">
        <button
          className={`tab-button ${activeTab === 'universities' ? 'active' : ''}`}
          onClick={() => handleTabChange('universities')}
        >
          <span className="tab-icon">🏛️</span>
          Universities
        </button>
        <button
          className={`tab-button ${activeTab === 'scholarships' ? 'active' : ''}`}
          onClick={() => handleTabChange('scholarships')}
        >
          <span className="tab-icon">💰</span>
          Scholarships
        </button>
      </div>

      <div className="finder-content">
        {activeTab === 'universities' ? (
          <UniversitySearch />
        ) : (
          <ScholarshipFinder />
        )}
      </div>
    </div>
  );
};

export default FinderPage;