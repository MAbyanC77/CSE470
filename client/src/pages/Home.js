import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Your Gateway to
              <span className="highlight"> Global Education</span>
            </h1>
            <p className="hero-description">
              EduGlobalBD empowers Bangladeshi students to pursue higher education abroad 
              with personalized guidance, comprehensive resources, and intelligent tools 
              all in one platform.
            </p>
            
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' ? (
                    <>
                      <Link to={getDashboardLink()} className="cta-button primary">
                        Go to Dashboard
                      </Link>
                      <Link to="/profile" className="cta-button secondary">
                        View Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="cta-button primary">
                        View Profile
                      </Link>
                      <Link to="/universities" className="cta-button secondary">
                        Find Universities
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link to="/signup" className="cta-button primary">
                    Start Your Journey
                  </Link>
                  <Link to="/login" className="cta-button secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="card-content">
                <div className="feature-preview">
                  <div className="preview-item">
                    <span className="icon">🎓</span>
                    <span>University Search</span>
                  </div>
                  <div className="preview-item">
                    <span className="icon">📋</span>
                    <span>Application Tracker</span>
                  </div>
                  <div className="preview-item">
                    <span className="icon">💰</span>
                    <span>Budget Planner</span>
                  </div>
                  <Link to="/resources" className="preview-item">
                  <span className="preview-icon">📚</span>
                  <span>Resource Library</span>
                </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose EduGlobalBD?</h2>
            <p>Comprehensive tools designed specifically for Bangladeshi students</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Smart University Search</h3>
              <p>Find the perfect universities based on your preferences, budget, and academic background with our intelligent matching system.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Application Tracking</h3>
              <p>Keep track of all your applications, deadlines, and requirements in one organized dashboard.</p>
            </div>
            

            
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Budget Planning</h3>
              <p>Plan your finances with detailed cost breakdowns, scholarship opportunities, and funding guidance.</p>
            </div>
            
            <Link to="/resources" className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Resource Library</h3>
              <p>Access comprehensive guides, sample documents, and preparation materials for your journey abroad.</p>
            </Link>
            
            <Link to="/community" className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Community Support</h3>
              <p>Connect with fellow students, alumni, and mentors in our supportive community network.</p>
            </Link>
          </div>
        </div>
      </section>



      {/* Statistics Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Universities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Students Helped</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Alumni Say</h2>
            <p>Success stories from students who achieved their dreams with EduGlobalBD</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"EduGlobalBD made my dream of studying at MIT a reality. The application tracking and guidance were invaluable!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Rashida Ahmed</h4>
                  <span>MIT, Computer Science</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The scholarship guidance helped me secure a full scholarship to University of Toronto. Forever grateful!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Mohammad Rahman</h4>
                  <span>University of Toronto, Engineering</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The budget planning tool was a game-changer. I could plan my finances perfectly for studying in Australia."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Fatima Khan</h4>
                  <span>University of Melbourne, Medicine</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Amazing platform! The university search feature helped me find the perfect match for my career goals."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Arif Hassan</h4>
                  <span>Oxford University, Business</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The community support was incredible. Connected with mentors who guided me through the entire process."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Nusrat Jahan</h4>
                  <span>Harvard University, Law</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"EduGlobalBD's resource library had everything I needed for IELTS prep and visa applications."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Tanvir Islam</h4>
                  <span>Stanford University, AI/ML</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Got into my dream university in Germany! The application tracker kept me organized throughout."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Sabrina Akter</h4>
                  <span>Technical University of Munich</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The personalized guidance made all the difference. Now studying my dream course in the UK!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Karim Uddin</h4>
                  <span>Imperial College London, Physics</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Excellent platform! The deadline tracker ensured I never missed any important dates."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Ruma Begum</h4>
                  <span>University of Sydney, Psychology</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"From application to visa, EduGlobalBD supported me every step of the way to Canada."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Shakib Al Hasan</h4>
                  <span>McGill University, Economics</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The scholarship database was comprehensive. Found multiple opportunities I never knew existed!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Lamia Sultana</h4>
                  <span>ETH Zurich, Data Science</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Best decision ever! EduGlobalBD helped me navigate the complex US admission process seamlessly."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Imran Hossain</h4>
                  <span>UC Berkeley, Environmental Science</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The mock interview sessions prepared me perfectly for my university interviews in the Netherlands."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Taslima Rahman</h4>
                  <span>Delft University, Architecture</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Amazing support system! The alumni network connected me with current students before I arrived."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Rifat Ahmed</h4>
                  <span>University of Edinburgh, Medicine</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The financial planning tools helped me budget perfectly for my studies in France. Highly recommended!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Nasir Khan</h4>
                  <span>Sorbonne University, Literature</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"EduGlobalBD made the impossible possible. Now pursuing my PhD at a top Japanese university!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Salma Khatun</h4>
                  <span>University of Tokyo, Robotics</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The document checklist feature ensured I had everything ready for my visa application. Stress-free process!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Mahbub Alam</h4>
                  <span>University of Copenhagen, Renewable Energy</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Incredible platform! The personalized university recommendations were spot-on for my profile."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Farhana Yasmin</h4>
                  <span>University of Auckland, Marine Biology</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Thanks to EduGlobalBD, I'm now studying at my dream university in Italy with a full scholarship!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Zahir Raihan</h4>
                  <span>Bocconi University, Finance</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The step-by-step guidance and 24/7 support made my journey to studying abroad smooth and successful!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Rashida Sultana</h4>
                  <span>University of Vienna, International Relations</span>
                </div>
                <div className="rating">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Your Journey?</h2>
              <p>Join thousands of Bangladeshi students who have successfully pursued their dreams abroad.</p>
              <div className="cta-actions">
                <Link to="/signup" className="cta-button primary large">
                  Create Free Account
                </Link>
                <Link to="/login" className="cta-button secondary large">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;