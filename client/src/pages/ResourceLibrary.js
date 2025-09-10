import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResourceLibrary.css';

const ResourceLibrary = () => {
  const [resources, setResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    targetAudience: '',
    difficulty: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    types: [],
    targetAudiences: [],
    difficulties: []
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchFeaturedResources();
  }, [filters, searchTerm, pagination.currentPage]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...filters
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axios.get('/api/resources', { params });
      
      if (response.data.success) {
        setResources(response.data.resources);
        setPagination(response.data.pagination);
        setAvailableFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedResources = async () => {
    try {
      const response = await axios.get('/api/resources/featured');
      if (response.data.success) {
        setFeaturedResources(response.data.resources);
      }
    } catch (error) {
      console.error('Error fetching featured resources:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchResources();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      type: '',
      targetAudience: '',
      difficulty: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const openResourceModal = async (resource) => {
    try {
      // Fetch full resource details and increment view count
      const response = await axios.get(`/api/resources/${resource._id}`);
      if (response.data.success) {
        setSelectedResource(response.data.resource);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching resource details:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResource(null);
  };

  const getTypeIcon = (type) => {
    const icons = {
      'PDF': '📄',
      'Article': '📝',
      'Video': '🎥',
      'Template': '📋',
      'Checklist': '✅',
      'Guide': '📚'
    };
    return icons[type] || '📄';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#4CAF50',
      'Intermediate': '#FF9800',
      'Advanced': '#F44336'
    };
    return colors[difficulty] || '#4CAF50';
  };

  return (
    <div className="resource-library">
      {/* Header Section */}
      <div className="resource-header">
        <div className="container">
          <h1>Resource Library</h1>
          <p>Access comprehensive guides, templates, and materials for your study abroad journey</p>
        </div>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>Featured Resources</h2>
            <div className="featured-grid">
              {featuredResources.map(resource => (
                <div 
                  key={resource._id} 
                  className="featured-card"
                  onClick={() => openResourceModal(resource)}
                >
                  <div className="featured-card-header">
                    <span className="resource-type">{getTypeIcon(resource.type)} {resource.type}</span>
                    <span className="resource-views">👁 {resource.views}</span>
                  </div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <div className="featured-card-footer">
                    <span className="resource-category">{resource.category}</span>
                    <span 
                      className="resource-difficulty"
                      style={{ color: getDifficultyColor(resource.difficulty) }}
                    >
                      {resource.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="search-section">
        <div className="container">
          <div className="search-filters-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  🔍
                </button>
              </div>
            </form>

            <div className="filters-container">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {availableFilters.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.targetAudience}
                onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
                className="filter-select"
              >
                <option value="">All Audiences</option>
                {availableFilters.targetAudiences.map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="filter-select"
              >
                <option value="">All Levels</option>
                {availableFilters.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>

              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="resources-section">
        <div className="container">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading resources...</p>
            </div>
          ) : (
            <>
              <div className="resources-header">
                <h2>All Resources ({pagination.totalItems})</h2>
              </div>
              
              {resources.length === 0 ? (
                <div className="no-resources">
                  <p>No resources found matching your criteria.</p>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="resources-grid">
                    {resources.map(resource => (
                      <div 
                        key={resource._id} 
                        className="resource-card"
                        onClick={() => openResourceModal(resource)}
                      >
                        <div className="resource-card-header">
                          <span className="resource-type">
                            {getTypeIcon(resource.type)} {resource.type}
                          </span>
                          <div className="resource-stats">
                            <span>👁 {resource.views}</span>
                            <span>❤️ {resource.likes}</span>
                          </div>
                        </div>
                        
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                        
                        <div className="resource-tags">
                          {resource.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                        
                        <div className="resource-card-footer">
                          <span className="resource-category">{resource.category}</span>
                          <span 
                            className="resource-difficulty"
                            style={{ color: getDifficultyColor(resource.difficulty) }}
                          >
                            {resource.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="pagination-btn"
                      >
                        Previous
                      </button>
                      
                      <span className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="pagination-btn"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Resource Modal */}
      {showModal && selectedResource && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedResource.title}</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="resource-meta">
                <span className="resource-type">
                  {getTypeIcon(selectedResource.type)} {selectedResource.type}
                </span>
                <span className="resource-category">{selectedResource.category}</span>
                <span 
                  className="resource-difficulty"
                  style={{ color: getDifficultyColor(selectedResource.difficulty) }}
                >
                  {selectedResource.difficulty}
                </span>
                <span className="resource-audience">{selectedResource.targetAudience}</span>
              </div>
              
              <p className="resource-description">{selectedResource.description}</p>
              
              <div className="resource-content">
                {selectedResource.type === 'Video' ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedResource.content }} />
                ) : (
                  <div className="content-text">
                    {selectedResource.content}
                  </div>
                )}
              </div>
              
              {selectedResource.fileUrl && (
                <div className="download-section">
                  <a 
                    href={selectedResource.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    📥 Download Resource
                  </a>
                </div>
              )}
              
              <div className="resource-tags">
                {selectedResource.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="resource-stats">
                <span>Views: {selectedResource.views}</span>
                <span>Likes: {selectedResource.likes}</span>
                <span>Author: {selectedResource.author}</span>
                <span>Updated: {new Date(selectedResource.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;