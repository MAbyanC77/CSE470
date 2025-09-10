import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Community.css';

const Community = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('forums');
  const [selectedCategory, setSelectedCategory] = useState('All Topics');

  const forumTopics = [
    {
      id: 1,
      title: 'University Application Tips',
      category: 'Applications',
      posts: 45,
      lastActivity: '2 hours ago',
      author: 'Sarah Ahmed'
    },
    {
      id: 2,
      title: 'IELTS Preparation Strategies',
      category: 'Test Prep',
      posts: 32,
      lastActivity: '5 hours ago',
      author: 'Mohammad Rahman'
    },
    {
      id: 3,
      title: 'Scholarship Opportunities 2024',
      category: 'Scholarships',
      posts: 67,
      lastActivity: '1 day ago',
      author: 'Fatima Khan'
    },
    {
      id: 4,
      title: 'Life in Canada - Student Experiences',
      category: 'Student Life',
      posts: 89,
      lastActivity: '2 days ago',
      author: 'Arif Hassan'
    },
    {
      id: 5,
      title: 'Visa Interview Preparation',
      category: 'Visa',
      posts: 23,
      lastActivity: '3 days ago',
      author: 'Nusrat Jahan'
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Dr. Rashida Ahmed',
      university: 'MIT',
      field: 'Computer Science',
      experience: '5 years',
      rating: 4.9,
      sessions: 150
    },
    {
      id: 2,
      name: 'Mohammad Rahman',
      university: 'University of Toronto',
      field: 'Engineering',
      experience: '4 years',
      rating: 4.8,
      sessions: 120
    },
    {
      id: 3,
      name: 'Fatima Khan',
      university: 'University of Melbourne',
      field: 'Medicine',
      experience: '6 years',
      rating: 5.0,
      sessions: 200
    },
    {
      id: 4,
      name: 'Arif Hassan',
      university: 'Oxford University',
      field: 'Business',
      experience: '3 years',
      rating: 4.7,
      sessions: 85
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Virtual University Fair 2024',
      date: 'March 15, 2024',
      time: '2:00 PM - 6:00 PM',
      type: 'Virtual Event',
      attendees: 250
    },
    {
      id: 2,
      title: 'IELTS Preparation Workshop',
      date: 'March 20, 2024',
      time: '10:00 AM - 12:00 PM',
      type: 'Online Workshop',
      attendees: 75
    },
    {
      id: 3,
      title: 'Scholarship Application Masterclass',
      date: 'March 25, 2024',
      time: '3:00 PM - 5:00 PM',
      type: 'Webinar',
      attendees: 120
    },
    {
      id: 4,
      title: 'Alumni Success Stories Panel',
      date: 'March 30, 2024',
      time: '7:00 PM - 9:00 PM',
      type: 'Live Panel',
      attendees: 180
    }
  ];

  return (
    <div className="community">
      {/* Hero Section */}
      <section className="community-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Community Support</h1>
            <p>Connect with fellow students, alumni, and mentors in our supportive community network</p>
            {!isAuthenticated && (
              <div className="hero-actions">
                <Link to="/signup" className="cta-button primary">
                  Join Community
                </Link>
                <Link to="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="community-nav">
        <div className="container">
          <div className="nav-tabs">
            <button 
              className={`tab-button ${activeTab === 'forums' ? 'active' : ''}`}
              onClick={() => setActiveTab('forums')}
            >
              <span className="tab-icon">💬</span>
              Discussion Forums
            </button>
            <button 
              className={`tab-button ${activeTab === 'mentors' ? 'active' : ''}`}
              onClick={() => setActiveTab('mentors')}
            >
              <span className="tab-icon">👨‍🏫</span>
              Find Mentors
            </button>
            <button 
              className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="tab-icon">📅</span>
              Events & Workshops
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="community-content">
        <div className="container">
          {/* Discussion Forums */}
          {activeTab === 'forums' && (
            <div className="forums-section">
              <div className="section-header">
                <h2>Discussion Forums</h2>
                <p>Join conversations with fellow students and get answers to your questions</p>
              </div>
              
              <div className="forum-categories">
                <div className="category-filter">
                  <button 
                    className={`filter-btn ${selectedCategory === 'All Topics' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('All Topics')}
                  >
                    All Topics
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'Applications' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Applications')}
                  >
                    Applications
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'Test Prep' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Test Prep')}
                  >
                    Test Prep
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'Scholarships' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Scholarships')}
                  >
                    Scholarships
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'Student Life' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Student Life')}
                  >
                    Student Life
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'Visa' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Visa')}
                  >
                    Visa
                  </button>
                </div>
              </div>

              <div className="forum-topics">
                {forumTopics
                  .filter(topic => selectedCategory === 'All Topics' || topic.category === selectedCategory)
                  .map(topic => (
                  <div key={topic.id} className="topic-card">
                    <div className="topic-info">
                      <h3>{topic.title}</h3>
                      <div className="topic-meta">
                        <span className="category">{topic.category}</span>
                        <span className="posts">{topic.posts} posts</span>
                        <span className="author">by {topic.author}</span>
                      </div>
                    </div>
                    <div className="topic-activity">
                      <span className="last-activity">{topic.lastActivity}</span>
                      <Link to={`/community/discussion/${topic.id}`} className="join-discussion">
                        Join Discussion
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mentors Section */}
          {activeTab === 'mentors' && (
            <div className="mentors-section">
              <div className="section-header">
                <h2>Find Mentors</h2>
                <p>Connect with experienced alumni and current students for guidance</p>
              </div>
              
              <div className="mentor-filters">
                <select className="filter-select">
                  <option value="">All Fields</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                  <option value="medicine">Medicine</option>
                  <option value="business">Business</option>
                </select>
                <select className="filter-select">
                  <option value="">All Universities</option>
                  <option value="mit">MIT</option>
                  <option value="toronto">University of Toronto</option>
                  <option value="melbourne">University of Melbourne</option>
                  <option value="oxford">Oxford University</option>
                </select>
              </div>

              <div className="mentors-grid">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="mentor-card">
                    <div className="mentor-avatar">
                      <span>{mentor.name.charAt(0)}</span>
                    </div>
                    <div className="mentor-info">
                      <h3>{mentor.name}</h3>
                      <p className="mentor-university">{mentor.university}</p>
                      <p className="mentor-field">{mentor.field}</p>
                      <div className="mentor-stats">
                        <span className="experience">{mentor.experience} experience</span>
                        <span className="rating">⭐ {mentor.rating}</span>
                        <span className="sessions">{mentor.sessions} sessions</span>
                      </div>
                    </div>
                    <div className="mentor-actions">
                      <button className="contact-mentor">
                        Contact Mentor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {activeTab === 'events' && (
            <div className="events-section">
              <div className="section-header">
                <h2>Events & Workshops</h2>
                <p>Join our upcoming events and workshops to enhance your knowledge</p>
              </div>
              
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-date">
                      <span className="month">{event.date.split(' ')[0]}</span>
                      <span className="day">{event.date.split(' ')[1].replace(',', '')}</span>
                    </div>
                    <div className="event-info">
                      <h3>{event.title}</h3>
                      <div className="event-details">
                        <span className="time">🕐 {event.time}</span>
                        <span className="type">📍 {event.type}</span>
                        <span className="attendees">👥 {event.attendees} attending</span>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button className="register-btn">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Community Stats */}
      <section className="community-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">150+</div>
              <div className="stat-label">Expert Mentors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Discussion Topics</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Monthly Events</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Community;